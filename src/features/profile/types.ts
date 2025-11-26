export interface ProviderApi {
  provider_id: number;
  id_provider?: number;
  user_id: number;
  profession: string;
  views_profile: number;
  about: string | null;
  rating_mid?: string;
  created_at: string;
  payment_preference?: "per_step" | "at_end";
}

export interface UserApi {
  id: number;
  name: string;
  email: string;
  createdAt: string;
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
