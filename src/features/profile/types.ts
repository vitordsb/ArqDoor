export interface ProviderApi {
  provider_id: number;
  id_provider?: number;
  user_id: number;
  profession: string;
  views_profile: number;
  about: string | null;
  rating_mid?: string;
  created_at: string;
}

export interface ProviderReceivingAccountApi {
  id: number;
  provider_id: number;
  nickname: string;
  bank_name: string;
  bank_agency: string;
  bank_account: string;
  bank_document: string;
  pix_key: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserApi {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  cpf?: string;
  cnpj?: string;
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
