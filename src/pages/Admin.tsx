import { Filter, LogOut, RefreshCcw, ShieldCheck } from "lucide-react";
import { TABS } from "@/features/admin/constants";
import { AdminConversationsSection } from "@/features/admin/components/AdminConversationsSection";
import { AdminContractsSection } from "@/features/admin/components/AdminContractsSection";
import { AdminDashboardView } from "@/features/admin/components/AdminOverviewSection";
import { AdminDocumentsSection } from "@/features/admin/components/AdminDocumentsSection";
import { AdminFiltersModal } from "@/features/admin/components/AdminFiltersModal";
import { AdminLoginView } from "@/features/admin/components/AdminLoginView";
import { AdminPaymentsSection } from "@/features/admin/components/AdminPaymentsSection";
import { EmptyState, PaginationControls } from "@/features/admin/components/AdminPrimitives";
import { AdminTransfersSection } from "@/features/admin/components/AdminTransfersSection";
import { AdminUsersSection } from "@/features/admin/components/AdminUsersSection";
import { useAdminDashboard } from "@/features/admin/hooks/useAdminDashboard";
import { useAdminPageMeta } from "@/features/admin/hooks/useAdminPageMeta";
import { useAdminSession } from "@/features/admin/hooks/useAdminSession";
import { cn, formatDateTime, openSecureFile } from "@/features/admin/utils";

export default function Admin() {
  useAdminPageMeta();

  const {
    email,
    password,
    isAuthenticated,
    authChecked,
    authSubmitting,
    authError,
    setEmail,
    setPassword,
    login,
    logout,
    expireSession,
  } = useAdminSession();

  const {
    dashboard,
    loading,
    error,
    activeTab,
    setActiveTab,
    showFilters,
    setShowFilters,
    draftFilters,
    appliedFilterCount,
    activePagination,
    refreshDashboard,
    applyFilters,
    resetFilters,
    updateDraftFilter,
    goToPreviousPage,
    goToNextPage,
    openConversationFromOverview,
    selectedUserId,
    selectedUser,
    userDetailTab,
    setUserDetailTab,
    selectUser,
    operationsOverview,
    loadingOperationsOverview,
    operationsOverviewError,
    selectedOperationsConversationId,
    selectOperationsConversation,
    selectedOperationsTicketId,
    selectOperationsTicket,
    paginatedUserConversations,
    paginatedUserContracts,
    paginatedUserSteps,
    prevUserConversationsPage,
    nextUserConversationsPage,
    prevUserContractsPage,
    nextUserContractsPage,
    prevUserStepsPage,
    nextUserStepsPage,
    directConversation,
    loadingDirectConversation,
    directConversationError,
    paginatedAdminMessages,
    prevAdminMessagesPage,
    nextAdminMessagesPage,
    messageDraft,
    setMessageDraft,
    sendingMessage,
    adminMessageError,
    sendAdminMessage,
    selectedConversationId,
    selectedConversationRow,
    conversationViewer,
    loadingConversationViewer,
    conversationViewerError,
    paginatedConversationMessages,
    loadConversationViewer,
    prevConversationMessagesPage,
    nextConversationMessagesPage,
  } = useAdminDashboard({
    isAuthenticated,
    onUnauthorized: expireSession,
  });

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-slate-100">
        <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6 py-10">
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-8 text-sm text-slate-600">
            Validando sessão administrativa...
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <AdminLoginView
        email={email}
        password={password}
        authSubmitting={authSubmitting}
        authError={authError}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onSubmit={login}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto w-full px-1 py-1">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-1">
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Painel interno
                </div>
                <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950 md:text-3xl">
                  Administração da operação
                </h1>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                  Visualize contratos, pagamentos, documentos e conversas sem expor dados
                  sensíveis.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={logout}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <LogOut className="h-4 w-4" />
                  Sair
                </button>
              </div>
            </div>
          </div>

          <div className="mt-2 rounded-2xl border border-slate-200 bg-white p-1">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition",
                  activeTab === key
                    ? "bg-slate-950 text-white"
                    : "text-slate-600 hover:bg-white hover:text-slate-900"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>

          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1">
                Atualizado em {formatDateTime(dashboard?.meta.generated_at)}
              </span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1">
                LGPD: CPF e senhas ocultos
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowFilters(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <Filter className="h-4 w-4" />
                Filtros
                {appliedFilterCount ? (
                  <span className="rounded-full bg-slate-950 px-2 py-0.5 text-[11px] text-white">
                    {appliedFilterCount}
                  </span>
                ) : null}
              </button>
              <button
                onClick={refreshDashboard}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <RefreshCcw className="h-4 w-4" />
                Atualizar
              </button>
            </div>
          </div>

          <AdminFiltersModal
            open={showFilters}
            activeTab={activeTab}
            dashboard={dashboard}
            draftFilters={draftFilters}
            onClose={() => setShowFilters(false)}
            onReset={resetFilters}
            onApply={applyFilters}
            onChange={updateDraftFilter}
          />

          {error ? (
            <div className="mt-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          {dashboard?.meta.partial_failures.length ? (
            <div className="mt-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Alguns blocos retornaram aviso:{" "}
              {dashboard.meta.partial_failures.map((failure) => failure.section).join(", ")}.
            </div>
          ) : null}

          {loading ? (
            <div className="mt-6 rounded-[30px] border border-slate-200/80 bg-white/90 px-6 py-16 text-center shadow-[0_18px_60px_-36px_rgba(15,23,42,0.28)]">
              <p className="text-base font-semibold text-slate-900">
                Atualizando visão administrativa...
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Carregando métricas, listas e contexto operacional.
              </p>
            </div>
          ) : null}

          {!loading && dashboard ? (
            <>
              {activeTab !== "all" && activePagination ? (
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-sm text-slate-500">{activePagination.total} registro(s)</div>
                  <PaginationControls
                    page={activePagination.page}
                    totalPages={activePagination.total_pages}
                    onPrevious={goToPreviousPage}
                    onNext={goToNextPage}
                  />
                </div>
              ) : null}

              <AdminDashboardView
                activeTab={activeTab}
                dashboard={dashboard}
                onOpenDocument={openSecureFile}
                onOpenConversation={openConversationFromOverview}
              />

              {activeTab === "usuarios" ? (
                <AdminUsersSection
                  users={dashboard.users}
                  selectedUserId={selectedUserId}
                  selectedUser={selectedUser}
                  onSelectUser={selectUser}
                  detailTab={userDetailTab}
                  onDetailTabChange={setUserDetailTab}
                  operationsOverview={operationsOverview}
                  loadingOperationsOverview={loadingOperationsOverview}
                  operationsOverviewError={operationsOverviewError}
                  selectedOperationsConversationId={selectedOperationsConversationId}
                  onSelectOperationsConversation={selectOperationsConversation}
                  selectedOperationsTicketId={selectedOperationsTicketId}
                  onSelectOperationsTicket={selectOperationsTicket}
                  paginatedUserConversations={paginatedUserConversations}
                  paginatedUserContracts={paginatedUserContracts}
                  paginatedUserSteps={paginatedUserSteps}
                  onPrevUserConversationsPage={prevUserConversationsPage}
                  onNextUserConversationsPage={nextUserConversationsPage}
                  onPrevUserContractsPage={prevUserContractsPage}
                  onNextUserContractsPage={nextUserContractsPage}
                  onPrevUserStepsPage={prevUserStepsPage}
                  onNextUserStepsPage={nextUserStepsPage}
                  directConversation={directConversation}
                  loadingDirectConversation={loadingDirectConversation}
                  directConversationError={directConversationError}
                  paginatedAdminMessages={paginatedAdminMessages}
                  onPrevAdminMessagesPage={prevAdminMessagesPage}
                  onNextAdminMessagesPage={nextAdminMessagesPage}
                  messageDraft={messageDraft}
                  onMessageDraftChange={setMessageDraft}
                  sendingMessage={sendingMessage}
                  adminMessageError={adminMessageError}
                  onSendAdminMessage={sendAdminMessage}
                />
              ) : null}

              {activeTab === "contratos" ? (
                <AdminContractsSection tickets={dashboard.tickets} />
              ) : null}

              {activeTab === "pagamentos" ? (
                <AdminPaymentsSection dashboard={dashboard} />
              ) : null}

              {activeTab === "transferencias" ? (
                <AdminTransfersSection transfers={dashboard.transfers} />
              ) : null}

              {activeTab === "documentos" ? (
                <AdminDocumentsSection documents={dashboard.documents} />
              ) : null}

              {activeTab === "conversas" ? (
                <AdminConversationsSection
                  conversations={dashboard.conversations}
                  selectedConversationId={selectedConversationId}
                  selectedConversationRow={selectedConversationRow}
                  conversationViewer={conversationViewer}
                  loadingConversationViewer={loadingConversationViewer}
                  conversationViewerError={conversationViewerError}
                  paginatedConversationMessages={paginatedConversationMessages}
                  onSelectConversation={loadConversationViewer}
                  onPrevMessagesPage={prevConversationMessagesPage}
                  onNextMessagesPage={nextConversationMessagesPage}
                />
              ) : null}
            </>
          ) : null}

          {!loading && !dashboard && !error ? (
            <div className="mt-6">
              <EmptyState
                title="Sem dados para exibir"
                description="Atualize o painel ou ajuste os filtros para reenquadrar a consulta administrativa."
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
