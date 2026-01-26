import type { CreateStepRequest, Step } from "@/lib/Interfaces";

export type ProposalStep = {
  id: string;
  title: string;
  price: number;
  startDate?: string;
  endDate?: string;
  paymentGroupId?: number;
};

export type ProposalStepPayload = Omit<CreateStepRequest, "ticket_id"> & {
  startDate?: string;
  endDate?: string;
  start_date?: string;
  end_date?: string;
};

export type PaymentMethod = "PIX" | "BOLETO" | "CREDIT_CARD" | "DEBIT_CARD";

export type PaymentDialogState = {
  step: Step;
  type: "step" | "deposit" | "group";
  data: any | null;
  method: PaymentMethod;
  loading: boolean;
  groupId?: number;
  groupName?: string;
  amount?: number;
};

export type GroupedPaymentDialogState = {
  steps: Step[];
  data: any | null;
  method: PaymentMethod;
  loading: boolean;
  groupId?: number;
};
