import { useEffect } from "react";
import { useLocation } from "wouter";

// Página de visualização de serviço individual ainda não implementada.
// Redireciona pro feed de serviços para evitar dead-end.
export default function ServicePage() {
  const [, navigate] = useLocation();
  useEffect(() => {
    navigate("/services", { replace: true });
  }, [navigate]);
  return null;
}
