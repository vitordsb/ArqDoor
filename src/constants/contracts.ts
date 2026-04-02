export const SIGNATURE_STEP_TITLE = "Assinatura do contrato (PDF)";
export const PROPOSAL_STEP_MIN_PRICE = 5;

export const isSignatureContractStep = (
  step?: { title?: string | null } | null
) =>
  (step?.title || "").trim().toLowerCase() ===
  SIGNATURE_STEP_TITLE.toLowerCase();

export const findSignatureContractStep = <
  T extends { title?: string | null }
>(
  steps: T[] = []
) => steps.find((step) => isSignatureContractStep(step)) || null;
