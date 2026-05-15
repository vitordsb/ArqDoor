export const SIGNATURE_STEP_TITLE = "Assinatura do contrato (PDF)";
export const PROPOSAL_STEP_MIN_PRICE = 5;

/**
 * Detecta se um step é a etapa de assinatura do contrato.
 *
 * Prioriza o flag `is_signature_step` (introduzido em 2026-05-08, é a fonte
 * de verdade). Cai pra detecção por título como fallback de compatibilidade —
 * útil para steps construídos no client antes de persistirem, ou pra
 * registros antigos que ainda não tiveram backfill.
 */
export const isSignatureContractStep = (
  step?: {
    title?: string | null;
    is_signature_step?: boolean | null;
    isSignatureStep?: boolean | null;
    price?: number | string | null;
  } | null
) => {
  if (!step) return false;
  if (step.is_signature_step === true || step.isSignatureStep === true) return true;
  const title = (step.title || "").trim().toLowerCase();
  const price = Number(step.price || 0);
  return title.includes("assinatura") && price === 0;
};

export const findSignatureContractStep = <
  T extends {
    title?: string | null;
    is_signature_step?: boolean | null;
    isSignatureStep?: boolean | null;
    price?: number | string | null;
  }
>(
  steps: T[] = []
) => steps.find((step) => isSignatureContractStep(step)) || null;
