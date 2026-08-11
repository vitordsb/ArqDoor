import { useEffect } from "react";

// Página pública estática para uso no navegador e na ficha da loja de aplicativos.
export default function TermsRedirect() {
  useEffect(() => {
    window.location.replace("/docs/usetermsprivacitypolices.html");
  }, []);
  return null;
}
