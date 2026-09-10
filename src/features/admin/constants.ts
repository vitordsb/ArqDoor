import type { AdminTabConfig, AdminTab, FilterState } from "./types";
import {
  BadgeDollarSign,
  BriefcaseBusiness,
  FileSignature,
  Landmark,
  MessageSquareText,
  Percent,
  Gift,
  ScrollText,
  ShieldCheck,
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
  // Separada de "Documentos", que e sobre PDF de CONTRATO. Esta e identidade: RG, CNH,
  // contrato social e comprovante de endereco. Juntar as duas numa aba so misturaria
  // conferir um contrato com conferir o RG de alguem.
  { key: "verificacao", label: "Verificação", icon: ShieldCheck },
  { key: "taxas", label: "Taxas", icon: Percent },
  { key: "indicacoes", label: "Indicações", icon: Gift },
  { key: "conversas", label: "Conversas", icon: MessageSquareText },
  { key: "auditoria", label: "Auditoria", icon: ScrollText },
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
  verificacao: 1,
  taxas: 1,
  indicacoes: 1,
  conversas: 1,
  auditoria: 1,
};

export const PAGE_SIZE_BY_TAB: Record<AdminTab, number> = {
  dashboard: 6,
  all: 6,
  usuarios: 12,
  contratos: 9,
  pagamentos: 10,
  transferencias: 8,
  documentos: 9,
  verificacao: 12,
  taxas: 10,
  indicacoes: 10,
  conversas: 10,
  auditoria: 50,
};

export const CLIENT_PAGE_SIZE = 5;
export const CLIENT_MESSAGE_PAGE_SIZE = 12;
