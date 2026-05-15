import { Filter, LogOut, RefreshCcw, ShieldCheck } from "lucide-react";
import { TABS } from "@/features/admin/constants";
import { AdminConversationsSection } from "@/features/admin/components/AdminConversationsSection";
import { AdminContractsSection } from "@/features/admin/components/AdminContractsSection";
import { AdminDashboardView } from "@/features/admin/components/AdminOverviewSection";
import { AdminDocumentsSection } from "@/features/admin/components/AdminDocumentsSection";
import { AdminFeesSection } from "@/features/admin/components/AdminFeesSection";
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
    payTransfer,
    payingTransferTicketId,
    payTransferError,
    verifyUser,
    verifyingUserId,
    verifyUserError,
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
      <div className="mx-auto w-full max-w-[1300px] px-3 sm:px-6 py-2">
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-slate-500" />
            <h1 className="text-sm font-semibold text-slate-900">Painel interno</h1>
            <span className="text-[11px] text-slate-400">·</span>
            <span className="text-[11px] text-slate-500">
              Atualizado {formatDateTime(dashboard?.meta.generated_at)}
            </span>
            <span className="hidden sm:inline text-[11px] text-slate-400">·</span>
            <span className="hidden sm:inline text-[11px] text-slate-500">LGPD ativo</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowFilters(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <Filter className="h-3.5 w-3.5" />
              Filtros
              {appliedFilterCount ? (
                <span className="rounded-full bg-slate-950 px-1.5 py-0.5 text-[10px] text-white">
                  {appliedFilterCount}
                </span>
              ) : null}
            </button>
            <button
              onClick={refreshDashboard}
              title="Atualizar"
              className="inline-flex items-center justify-center rounded-lg border border-slate-200 p-1.5 text-slate-700 transition hover:bg-slate-50"
            >
              <RefreshCcw className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sair
            </button>
          </div>
        </div>

        <div className="mt-2 flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-white p-1">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition",
                activeTab === key
                  ? "bg-slate-950 text-white"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
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
                  onVerifyUser={verifyUser}
                  verifyingUserId={verifyingUserId}
                  verifyUserError={verifyUserError}
                />
              ) : null}

              {activeTab === "contratos" ? (
                <AdminContractsSection tickets={dashboard.tickets} />
              ) : null}

              {activeTab === "pagamentos" ? (
                <AdminPaymentsSection dashboard={dashboard} />
              ) : null}

              {activeTab === "transferencias" ? (
                <AdminTransfersSection
                  transfers={dashboard.transfers}
                  onPayTransfer={payTransfer}
                  payingTicketId={payingTransferTicketId}
                  payTransferError={payTransferError}
                />
              ) : null}

              {activeTab === "documentos" ? (
                <AdminDocumentsSection documents={dashboard.documents} />
              ) : null}

              {activeTab === "taxas" ? <AdminFeesSection /> : null}

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
          <div className="mt-4">
            <EmptyState
              title="Sem dados para exibir"
              description="Atualize o painel ou ajuste os filtros para reenquadrar a consulta administrativa."
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
