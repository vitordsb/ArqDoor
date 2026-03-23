/**
 * Configuração do Sentry — Frontend (React + Vite)
 *
 * Variável de ambiente necessária no .env.production:
 *   VITE_SENTRY_DSN=https://xxxxx@oxxxxx.ingest.sentry.io/xxxxx
 */

import * as Sentry from "@sentry/react";

const SENSITIVE_KEYS = [
  "password",
  "senha",
  "token",
  "cpf",
  "cnpj",
  "authorization",
  "cookie",
  "signature_password",
];

/**
 * Remove dados sensíveis de um objeto antes de enviar ao Sentry.
 */
const scrubSensitive = (obj: Record<string, unknown>): Record<string, unknown> => {
  if (!obj || typeof obj !== "object") return obj;
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => {
      if (SENSITIVE_KEYS.some((k) => key.toLowerCase().includes(k))) {
        return [key, "[Filtered]"];
      }
      if (value && typeof value === "object") {
        return [key, scrubSensitive(value as Record<string, unknown>)];
      }
      return [key, value];
    })
  );
};

const scrubStringMap = (obj: Record<string, string>): Record<string, string> => {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => {
      if (SENSITIVE_KEYS.some((k) => key.toLowerCase().includes(k))) {
        return [key, "[Filtered]"];
      }
      return [key, value];
    })
  );
};

export const initSentry = () => {
  const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;

  if (!dsn || import.meta.env.DEV) {
    // Não inicializa em desenvolvimento local
    return;
  }

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,

    integrations: [
      // Rastreamento de navegação e requisições HTTP
      Sentry.browserTracingIntegration(),

      // Session Replay — grava sessão quando ocorre um erro
      Sentry.replayIntegration({
        maskAllText: true,      // Oculta todo texto (LGPD)
        blockAllMedia: false,   // Permite imagens para contexto visual
        maskAllInputs: true,    // Oculta todos os inputs (senhas, etc.)
      }),
    ],

    // 10% das navegações em produção, 100% em staging
    tracesSampleRate: 0.1,

    // Replay: 5% das sessões normais, 100% com erro
    replaysSessionSampleRate: 0.05,
    replaysOnErrorSampleRate: 1.0,

    // Erros para ignorar (erros de rede, extensões de browser, etc.)
    ignoreErrors: [
      "Network request failed",
      "Failed to fetch",
      "NetworkError",
      "Tempo de conexão esgotado",
      /^ResizeObserver loop/,
      /^Non-Error exception captured/,
      "ChunkLoadError",           // Falha de lazy load (usuário com conexão ruim)
    ],

    beforeSend(event) {
      // Nunca enviar em desenvolvimento
      if (import.meta.env.DEV) return null;

      // Scrub dados sensíveis do request
      if (event.request?.data && typeof event.request.data === "object") {
        event.request.data = scrubSensitive(
          event.request.data as Record<string, unknown>
        );
      }

      // Remove cookies do evento
      if (event.request?.cookies) {
        event.request.cookies = scrubStringMap(
          event.request.cookies as Record<string, string>
        );
      }

      // Remove headers sensíveis
      if (event.request?.headers) {
        event.request.headers = scrubStringMap(
          event.request.headers as Record<string, string>
        );
      }

      return event;
    },
  });
};

export { Sentry };
