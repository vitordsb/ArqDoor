export const SIGNATURE_STEP_TITLE = "Assinatura do contrato (PDF)";

type ContractStepLike = {
  title?: string | null;
  is_signature_step?: boolean | null;
  isSignatureStep?: boolean | null;
};

export const isSignatureContractStep = (step?: ContractStepLike | null) =>
  Boolean(
    step?.is_signature_step ||
      step?.isSignatureStep ||
      step?.title === SIGNATURE_STEP_TITLE
  );

export const findSignatureContractStep = <T extends ContractStepLike>(steps: T[]) =>
  steps.find(isSignatureContractStep);
