/**
 * Tokens de estilo do painel administrativo.
 *
 * Por que existe: o painel foi construído com slate-950 como cor primária
 * (estética "dashboard genérico"), enquanto o resto do ArqDoor usa orange-600.
 * Operador entrava no admin e parecia outro produto.
 *
 * Aqui ficam as classes Tailwind consumidas por todos os componentes do admin.
 * Mudanças de identidade visual passam por aqui — não por cada componente.
 *
 * Filosofia:
 * - orange-600 = cor de marca, ações primárias (selecionar tab, CTAs neutras)
 * - emerald-600 = ações positivas explícitas (verificar conta, marcar como pago)
 * - rose-600 = ações destrutivas explícitas (suspender, excluir)
 * - amber = alerta intermediário ("tem trabalho a fazer mas não é emergência")
 * - slate-950 NÃO é mais usado como cor primária; só como cor de texto em headings
 */

export const ADMIN_TOKENS = {
  // Estados de elementos selecionáveis (tabs, toggles, chips)
  selectable: {
    active: "bg-orange-600 text-white",
    inactive: "text-slate-600 hover:bg-orange-50 hover:text-orange-700",
  },
  // Ações primárias (não-semânticas)
  primaryButton: "bg-orange-600 hover:bg-orange-700 text-white",
  // Headings
  pageHeading: "text-sm font-semibold text-slate-900",
  sectionHeading: "text-xs font-semibold uppercase tracking-wide text-slate-700",
  caption: "text-[11px] font-medium uppercase tracking-wide text-slate-500",
  // Surfaces
  cardSurface: "rounded-2xl border border-slate-200 bg-white",
  // Filler de "alerta de trabalho"
  alertSoft: "border-orange-300 bg-orange-50",
  alertText: "text-orange-700",
  // Brand accent (ícones, ênfases pontuais)
  brandIcon: "text-orange-600",
} as const;
