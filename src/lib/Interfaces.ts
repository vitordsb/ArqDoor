export interface LogFunc {
  (message?: any, ...optionalParams: any[]): void
}
export interface LoginInterface {
  email: string;
  password: string;
}
export interface GoogleLoginPayload {
  idToken?: string;
  accessToken?: string;
  type?: "contratante" | "prestador";
  mode?: "login" | "register";
}
export interface GoogleLoginResult {
  status: "logged_in" | "logged_in_needs_onboarding" | "already_connected" | "failed" | "registered";
}
export interface RegisterInterface {
  name: string;
  email: string;
  gender: string;
  birth: string;
  type: "contratante" | "prestador";
  password: string;
  confirmPassword: string;
  termos_aceitos: boolean;
}
export interface User {
  id: number;
  name: string;
  email: string;
  about: string;
  cpf?: string;
  cnpj?: string;
  birth: string;
  gender: string;
  provider_id?: number;
  payload: string;
  type: "contratante" | "prestador";
  termos_aceitos: boolean;
  perfil_completo?: boolean;
  signature_password_set?: boolean | null;
  perfil?: string;
  banner?: string | null;
  avatar?: string | null;
}
export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  isInitialized: boolean;
  login: (data: LoginInterface) => Promise<boolean>;
  loginWithGoogle: (payload: GoogleLoginPayload) => Promise<GoogleLoginResult | undefined>;
  register: (data: RegisterInterface) => Promise<boolean>;
  logout: () => Promise<void>;
  needsOnboarding: boolean;
  setNeedsOnboarding: (value: boolean) => void;
  onboardingOptional: boolean;
  setOnboardingOptional: (value: boolean) => void;
  updateUserLocal: (data: Partial<User>) => void;
}
export interface Conversation {
  id: number;
  user1_id: number;
  user2_id: number;
  isNegotiation: boolean;
  created_at: string;
  updated_at: string;
  otherUser: {
    id: number;
    name: string;
    email: string;
    type: "prestador" | "contratante";
    provider_id?: number | null;
    perfil?: string | null;
    avatar?: string | null;
    banner?: string | null;
  };
  lastMessage?: {
    id: number;
    content: string;
    created_at: string;
    sender_id: number;
    type?: string;
  };
  unreadCount: number;
}

export interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  content: string;
  created_at: string;
  updated_at: string;
  tempId?: string;
  type?: 'text' | 'proposal'; // Novo campo para tipo de mensagem
  proposal_data?: {
    ticket_id: number;
    steps: Array<{
      id: number;
      title: string;
      price: number;
      status?: string;
    }>;
    total: number;
  };
}

export interface CreateConversationRequest {
  user1_id: number;
  user2_id: number;
}

export interface CreateMessageRequest {
  conversation_id: number;
  content: string;
  type?: 'text' | 'proposal';
  proposal_data?: any;
}

export interface CreateTicketRequest {
  conversation_id: number;
  payment_preference?: "per_step" | "at_end" | "custom";
  allow_grouped_payment?: boolean;
  allowGroupedPayment?: boolean;
  grouped_payment?: boolean;
  grouped_payment_enabled?: boolean;
  payment?: boolean;
  provider_id?: number;
}

export interface CreateStepRequest {
  ticket_id: number;
  title: string;
  price: number;
}

export interface UpdateStepRequest {
  title?: string;
  price?: number;
  status?: string;
  provider_completed?: boolean;
  client_confirmed?: boolean;
}

export interface SignDocumentRequest {
  ticket_id: number;
  password: string;
  user_id: number;
}

export interface Step {
  id: number;
  ticket_id: number;
  title: string;
  price: number;
  status?: string;
  sequence?: number;
  started_at?: string | null;
  completed_at?: string | null;
  provider_completed?: boolean;
  client_confirmed?: boolean;
  created_at?: string;
  updated_at?: string;
  group_id?: number;
  group_sequence?: number;
  payment_group_id?: number;
  payment_group?: {
    id: number;
    name: string;
  };
  paymentGroup?: {
    id: number;
    name: string;
  };
}

export interface TicketService {
  id: number;
  conversation_id: number;
  provider_id: number;
  status: string;
  payment_preference?: "per_step" | "at_end" | "custom";
  allow_grouped_payment?: boolean;
  created_at: string;
  updated_at: string;
}

// Pagamento Avulso (Additional Payment)
export interface AdditionalPayment {
  id: number;
  ticket_id: number;
  provider_id: number;
  contractor_id: number;
  payment_id?: number | null;
  title: string;
  description: string;
  amount: number;
  status: "PENDING" | "ACCEPTED" | "REFUSED" | "PAID" | "CANCELLED";
  refusal_reason?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateAdditionalPaymentRequest {
  ticket_id: number;
  title: string;
  description: string;
  amount: number;
}

export interface RespondAdditionalPaymentRequest {
  action: "accept" | "refuse";
  method?: "PIX" | "BOLETO" | "CREDIT_CARD" | "DEBIT_CARD";
  reason?: string;
}
