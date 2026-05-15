import { useEffect } from "react";

// Termos de uso e política de privacidade: redireciona pro PDF estático em public/docs.
export default function TermsRedirect() {
  useEffect(() => {
    window.location.replace("/docs/usetermsprivacitypolices.pdf");
  }, []);
  return null;
}
