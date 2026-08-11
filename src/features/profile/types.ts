export interface ProviderApi {
  provider_id: number;
  id_provider?: number;
  user_id: number;
  profession: string;
  views_profile: number;
  about: string | null;
  rating_mid?: string;
  created_at: string;
  payment_preference?: "per_step" | "at_end" | "custom";
}

export interface UserApi {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  cpf?: string;
  cnpj?: string;
}

export interface ProviderReceivingAccountApi {
  id: number;
  nickname: string;
  bank_code?: string | null;
  bank_name?: string | null;
  bank_agency?: string | null;
  bank_account?: string | null;
  bank_document?: string | null;
  pix_key?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Service {
  id_serviceFreelancer: number;
  id_provider: number;
  title: string;
  description: string;
  price: string;
  created_at: string;
}

export interface PortfolioItem {
  id: number;
  image_id: number;
  user_id: number;
  title: string;
  description: string;
  created_at: string;
  UserImage?: {
    image_path: string;
  };
}
