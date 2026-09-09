/**
 * Estados em que uma cobranca de cartao PRECISA poder ser refeita.
 *
 * Mesma lista do app (`arqdoor-mobile/src/components/PaymentSheet.tsx`). Sem ela o site
 * escondia o formulario assim que existisse qualquer cobranca de cartao, inclusive uma
 * recusada: o cliente ficava olhando para uma recusa, sem nenhum caminho para tentar de
 * novo com outro cartao.
 */
const STATUS_RECUSADO = new Set([
  "CANCELLED",
  "FAILED",
  "REFUSED",
  "NOT_AUTHORIZED",
  "PAYMENT_DELETED",
  "REFUNDED",
  "CHARGEDBACK",
]);

export const cobrancaRecusada = (data: { status?: string | null } | null | undefined) =>
  STATUS_RECUSADO.has(String(data?.status ?? "").toUpperCase());
