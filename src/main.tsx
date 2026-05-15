// Sentry deve ser inicializado antes de qualquer outro import
import { initSentry } from "./lib/sentry";
initSentry();

import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { AuthProvider } from "./hooks/use-auth";
import { GoogleOAuthProvider } from "@react-oauth/google";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
if (!googleClientId) {
  console.warn("VITE_GOOGLE_CLIENT_ID não definido; login com Google ficará indisponível.");
}

// O GoogleOAuthProvider precisa SEMPRE envolver a app, mesmo sem clientId.
// O hook useGoogleLogin lança "GoogleOAuthProvider is not in the React tree"
// se chamado fora do provider, derrubando o /auth no ErrorBoundary. Usamos
// um placeholder quando o clientId não está disponível — o botão de login
// social já checa `googleEnabled` antes de disparar, então fica safe.
const effectiveClientId = googleClientId || "placeholder.apps.googleusercontent.com";

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <GoogleOAuthProvider clientId={effectiveClientId}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </GoogleOAuthProvider>
  </QueryClientProvider>
);
