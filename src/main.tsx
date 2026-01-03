import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { AuthProvider } from "./hooks/use-auth";
import { GoogleOAuthProvider } from "@react-oauth/google";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "1084357165027-u9j7m9bdhle14p84d7931j332f9bt9on.apps.googleusercontent.com";
const hasGoogleClientId = !!googleClientId;
if (!hasGoogleClientId) {
  console.warn("VITE_GOOGLE_CLIENT_ID não definido; login com Google ficará indisponível.");
}

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    {hasGoogleClientId ? (
      <GoogleOAuthProvider clientId={googleClientId}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </GoogleOAuthProvider>
    ) : (
      <AuthProvider>
        <App />
      </AuthProvider>
    )}
  </QueryClientProvider>
);
