import type { AdminTabConfig, AdminTab, FilterState } from "./types";
import {
  BadgeDollarSign,
  BriefcaseBusiness,
  FileSignature,
  Landmark,
  MessageSquareText,
  Sparkles,
  Users,
} from "lucide-react";

export const TABS: AdminTabConfig[] = [
  { key: "dashboard", label: "Dashboard", icon: Sparkles },
  { key: "usuarios", label: "Usuários", icon: Users },
  { key: "contratos", label: "Contratos", icon: BriefcaseBusiness },
  { key: "pagamentos", label: "Pagamentos", icon: BadgeDollarSign },
  { key: "transferencias", label: "Transferências", icon: Landmark },
  { key: "documentos", label: "Documentos", icon: FileSignature },
  { key: "conversas", label: "Conversas", icon: MessageSquareText },
];

export const EMPTY_FILTERS: FilterState = {
  search: "",
  state: "",
  city: "",
  userType: "",
  contractStatus: "",
  paymentPreference: "",
  paymentBucket: "",
  signed: "",
  conversationKind: "",
  minValue: "",
  maxValue: "",
  dateFrom: "",
  dateTo: "",
};

export const INITIAL_PAGES: Record<AdminTab, number> = {
  dashboard: 1,
  all: 1,
  usuarios: 1,
  contratos: 1,
  pagamentos: 1,
  transferencias: 1,
  documentos: 1,
  conversas: 1,
};

export const PAGE_SIZE_BY_TAB: Record<AdminTab, number> = {
  dashboard: 6,
  all: 6,
  usuarios: 12,
  contratos: 9,
  pagamentos: 10,
  transferencias: 8,
  documentos: 9,
  conversas: 10,
};

export const CLIENT_PAGE_SIZE = 5;
export const CLIENT_MESSAGE_PAGE_SIZE = 12;
