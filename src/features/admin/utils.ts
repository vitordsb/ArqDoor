import { API_BASE_URL } from "@/lib/queryClient";
import type {
  AdminOperationalStep,
  ClientPagination,
  Participant,
} from "./types";

export const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 2,
});

const compactFormatter = new Intl.NumberFormat("pt-BR", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export const formatCurrency = (value: number) =>
  currencyFormatter.format(Number(value || 0));

export const formatCompact = (value: number) =>
  compactFormatter.format(Number(value || 0));

/**
 * Tempo relativo curto em PT-BR: "há 5s", "há 2min", "há 3h", "há 2d".
 * Usado no header do painel pra evitar mostrar timestamp absoluto que sempre
 * dá impressão de "stale" mesmo quando é recente.
 */
export const formatRelativeTime = (value: string | null | undefined, nowMs?: number) => {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";
  const diffMs = (nowMs ?? Date.now()) - parsed.getTime();
  if (diffMs < 0) return "agora";
  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 10) return "agora";
  if (seconds < 60) return `há ${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `há ${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `há ${days}d`;
  return formatDateTime(value);
};

export const formatDateTime = (value: string | null | undefined) => {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
};

/**
 * Formata um telefone armazenado em dígitos (10 ou 11) para o padrão BR
 * `(XX) XXXXX-XXXX` ou `(XX) XXXX-XXXX`. Retorna `—` quando ausente.
 */
export const formatPhoneBr = (value: string | null | undefined) => {
  if (!value) return "—";
  const digits = String(value).replace(/\D/g, "");
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return value;
};

/** URL pronta pra disparar WhatsApp com o telefone do usuário. */
export const buildWhatsappUrl = (phone: string | null | undefined) => {
  if (!phone) return null;
  const digits = String(phone).replace(/\D/g, "");
  if (digits.length < 10) return null;
  // Adiciona 55 (BR) se vier sem código de país
  const withCountry = digits.length === 13 ? digits : `55${digits}`;
  return `https://wa.me/${withCountry}`;
};

export const formatDate = (value: string | null | undefined) => {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parsed);
};

export const sortByNewest = (
  leftDate: string | null | undefined,
  rightDate: string | null | undefined
) => new Date(rightDate || 0).getTime() - new Date(leftDate || 0).getTime();

export const getFileUrl = (path: string | null | undefined) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${API_BASE_URL}/${path.replace(/^\/+/, "")}`;
};

export const openSecureFile = (pathOrUrl: string | null | undefined) => {
  const url = getFileUrl(pathOrUrl);
  if (!url) {
    window.alert("Arquivo indisponível.");
    return;
  }

  window.open(url, "_blank", "noopener,noreferrer");
};

export const paymentBucketLabel = (bucket: string) => {
  if (bucket === "running") return "Rodando";
  if (bucket === "paid") return "Pago";
  if (bucket === "failed") return "Falhou";
  return "Outro";
};

export const paymentBucketTone = (bucket: string) => {
  if (bucket === "paid") return "emerald" as const;
  if (bucket === "failed") return "rose" as const;
  if (bucket === "running") return "sky" as const;
  return "slate" as const;
};

export const preferenceLabel = (value: string | null) => {
  if (value === "at_end") return "Em garantia";
  if (value === "per_step") return "Por etapas";
  if (value === "custom") return "Em garantia";
  return "—";
};

export const receivingMethodLabel = (value: string | null | undefined) =>
  value === "standard" ? "Padrão" : "Escrow";

export const stepStatusTone = (status: string | null | undefined) => {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "concluido") return "emerald" as const;
  if (normalized === "recusado") return "rose" as const;
  if (normalized === "em andamento") return "sky" as const;
  return "amber" as const;
};

export const stepPaymentLabel = (step: AdminOperationalStep) => {
  if (step.is_financially_cleared) return "Cliente já pagou";
  if (step.payment_status_bucket === "running") return "Cobrança em andamento";
  if (step.payment_status_bucket === "failed") return "Pagamento com falha";
  return "Pagamento pendente";
};

export const participantRoleLabel = (participant: Participant | null) => {
  if (!participant) return "Perfil";
  if (participant.is_admin) return "ArqDoor ADM";
  return participant.type === "prestador" ? "Prestador" : "Cliente";
};

export const participantTone = (participant: Participant | null) => {
  if (!participant) return "slate" as const;
  if (participant.is_admin) return "sky" as const;
  return participant.type === "prestador" ? "emerald" : "amber";
};

export const participantSubtitle = (participant: Participant | null) => {
  if (!participant) return "Sem vínculo";
  const location = [participant.city, participant.state]
    .filter(Boolean)
    .join(", ");
  // Admin sempre vê email completo (decisão 2026-05-18). Cai pro mascarado
  // só se o completo não vier (ex: payload de endpoints legados).
  const emailToShow = (participant as any).email || participant.masked_email;
  const phone = (participant as any).phone
    ? formatPhoneBr((participant as any).phone)
    : null;
  return (
    [emailToShow, phone, location || null].filter(Boolean).join(" • ") ||
    "Sem dados complementares"
  );
};

export const paginateClientSide = <T,>(
  items: T[],
  page: number,
  pageSize: number
): ClientPagination<T> => {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const start = (currentPage - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    page: currentPage,
    total,
    totalPages,
  };
};
