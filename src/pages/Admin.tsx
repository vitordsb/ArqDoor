import React, { useState, useEffect, useMemo } from "react";
import { apiRequest, API_BASE_URL } from "@/lib/queryClient";

type DashboardData = {
  tickets: any[];
  users: any[];
  conversations: any[];
  payments: {
    pending: any[];
    paid: any[];
  };
};

type TabKey = "usuarios" | "contratos" | "pagamentos" | "conversas";

const badge = (text: string, variant: "green" | "red" | "amber" | "gray" = "gray") => {
  const map: Record<string, string> = {
    green: "bg-emerald-100 text-emerald-800",
    red: "bg-rose-100 text-rose-700",
    amber: "bg-amber-100 text-amber-800",
    gray: "bg-slate-100 text-slate-700",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${map[variant]}`}>
      {text}
    </span>
  );
};

export default function Admin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authHeader, setAuthHeader] = useState<string | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("usuarios");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [adminId, setAdminId] = useState<number | null>(null);
  const [msgInput, setMsgInput] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [refreshFlag, setRefreshFlag] = useState(0);
  const [ticketSearch, setTicketSearch] = useState("");

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    const basic = btoa(`${email}:${password}`);
    setAuthHeader(basic);
  };

  const loadConversation = async (userId: number) => {
    if (!authHeader) return;
    setLoadingMessages(true);
    try {
      const res = await apiRequest("GET", `/admin/messages/${userId}`, undefined, {
        Authorization: `Basic ${authHeader}`,
      });
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      setMessages(json.data.messages || []);
      setAdminId(json.data.admin_id || null);
      setSelectedUserId(userId);
    } catch (err: any) {
      alert(err?.message || "Erro ao carregar mensagens");
      setMessages([]);
      setSelectedUserId(null);
    } finally {
      setLoadingMessages(false);
    }
  };

  const contactUser = async (userId: number) => {
    if (!authHeader) return;
    const content = msgInput || prompt("Mensagem para o usuário:") || "";
    if (!content || !content.trim()) return;
    try {
      const res = await apiRequest(
        "POST",
        "/admin/message",
        { userId, content },
        { Authorization: `Basic ${authHeader}`, "Content-Type": "application/json" }
      );
      if (!res.ok) throw new Error(await res.text());
      setMsgInput("");
      await loadConversation(userId);
      alert("Mensagem enviada como ArqDoor-ADM.");
    } catch (err: any) {
      alert(err?.message || "Falha ao enviar mensagem.");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!authHeader) return;
      setLoading(true);
      setError(null);
      try {
        const res = await apiRequest("GET", "/admin/dashboard", undefined, {
          Authorization: `Basic ${authHeader}`,
        });
        if (!res.ok) throw new Error(await res.text());
        const json = await res.json();
        setData(json.data);
      } catch (err: any) {
        setError(err?.message || "Erro ao carregar dashboard");
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [authHeader, refreshFlag]);

  const handleDeleteTicket = async (ticketId: number) => {
    if (!authHeader) return;
    const confirmPwd = prompt("Confirme a senha de administrador para excluir o ticket:");
    if (!confirmPwd || !confirmPwd.trim()) return;
    const basicHeader = btoa(`${email}:${confirmPwd}`);
    try {
      const res = await apiRequest(
        "DELETE",
        `/admin/contracts/${ticketId}`,
        undefined,
        { Authorization: `Basic ${basicHeader}` }
      );
      const body = await res.json().catch(() => ({}));
      if (!res.ok || body?.success === false) {
        throw new Error(body?.message || "Falha ao excluir o ticket");
      }
      alert("Ticket excluído com sucesso.");
      setRefreshFlag((prev) => prev + 1);
    } catch (err: any) {
      alert(err?.message || "Erro ao excluir ticket.");
    }
  };

  const sortedFilteredTickets = useMemo(() => {
    const list = Array.isArray(data?.tickets) ? [...data.tickets] : [];
    const sorted = list.sort((a, b) => a.id - b.id);
    const term = ticketSearch.trim();
    if (!term) return sorted;
    return sorted.filter((t) => String(t.id).includes(term));
  }, [data?.tickets, ticketSearch]);

  if (!authHeader) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-6 border border-slate-200">
          <h1 className="text-2xl font-bold mb-4 text-slate-900">Admin Login</h1>
          <p className="text-sm text-slate-600 mb-4">Acesso restrito à equipe ArqDoor.</p>
          <form className="space-y-4" onSubmit={login}>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Email</label>
              <input
                className="w-full border border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 px-3 py-2 rounded-lg outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="arqdoor@admin.com.br"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Senha</label>
              <input
                type="password"
                className="w-full border border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 px-3 py-2 rounded-lg outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-slate-900 text-white py-2 rounded-lg font-semibold hover:bg-slate-800 transition"
            >
              Entrar
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">Painel de monitoramento</p>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard Admin</h1>
        </div>
        <button
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm hover:bg-white shadow-sm"
          onClick={() => {
            setAuthHeader(null);
            setData(null);
            setEmail("");
            setPassword("");
          }}
        >
          Sair
        </button>
      </div>

      <div className="px-6">
        {loading && <p className="text-slate-600">Carregando...</p>}
        {error && <p className="text-red-600 font-semibold">{error}</p>}
      </div>

      {data && (
        <div className="p-6">
          <div className="flex gap-2 mb-4">
            {(["usuarios", "contratos", "pagamentos", "conversas"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-2 rounded-lg text-sm font-semibold border ${
                  activeTab === tab
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-700 border-slate-200"
                }`}
              >
                {tab === "usuarios" && "Usuários"}
                {tab === "contratos" && "Contratos"}
                {tab === "pagamentos" && "Pagamentos"}
                {tab === "conversas" && "Conversas"}
              </button>
            ))}
          </div>

          {activeTab === "contratos" && (
            <section className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <p className="text-sm text-slate-600">
                  {sortedFilteredTickets.length} ticket(s) listado(s) · ordenados por ID
                </p>
                <div className="flex items-center gap-2">
                  <input
                    value={ticketSearch}
                    onChange={(e) => setTicketSearch(e.target.value)}
                    placeholder="Pesquisar pelo ID do ticket"
                    className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                  />
                  {ticketSearch && (
                    <button
                      className="text-sm text-slate-500 hover:text-slate-700"
                      onClick={() => setTicketSearch("")}
                    >
                      Limpar
                    </button>
                  )}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {sortedFilteredTickets.map((t: any) => (
                  <div key={t.id} className="border border-slate-200 rounded-xl p-3 bg-white shadow-sm">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Ticket #{t.id}</span>
                      {badge(t.status || "—", (t.status || "").toLowerCase() === "concluída" ? "green" : "amber")}
                    </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Conv {t.conversation_id} · Provider {t.provider_id} · Etapas: {t.steps_count}
                  </p>
                  {t.has_pending_payment && (
                    <div className="mt-1">{badge("Pagamento pendente", "red")}</div>
                  )}
                  <div className="mt-2 flex gap-2">
                    <button
                      className="px-3 py-1 text-xs border border-slate-200 rounded-lg hover:bg-slate-50"
                      onClick={async () => {
                        if (!authHeader) return;
                        try {
                          const res = await apiRequest(
                            "GET",
                            `/admin/contracts/${t.id}/attachments`,
                            undefined,
                            { Authorization: `Basic ${authHeader}` }
                          );
                          if (!res.ok) throw new Error(await res.text());
                          const json = await res.json();
                          const att = (json.data || [])[0];
                          if (!att?.pdf_path) {
                            alert("Nenhum PDF anexado.");
                            return;
                          }
                          const url = att.pdf_path.startsWith("http")
                            ? att.pdf_path
                            : `${API_BASE_URL}/${att.pdf_path.replace(/^\/+/, "")}`;
                          window.open(url, "_blank");
                        } catch (e: any) {
                          alert(e?.message || "Erro ao abrir PDF.");
                        }
                      }}
                    >
                      Ver PDF do contrato
                    </button>
                    <button
                      className="px-3 py-1 text-xs border border-rose-200 text-rose-700 rounded-lg hover:bg-rose-50"
                      onClick={() => handleDeleteTicket(t.id)}
                    >
                      Excluir ticket
                    </button>
                  </div>
                </div>
                ))}
              </div>
            </section>
          )}

          {activeTab === "usuarios" && (
            <div className="grid gap-3 lg:grid-cols-[320px,1fr]">
              <div className="border border-slate-200 rounded-xl bg-white shadow-sm">
                <div className="p-3 border-b font-semibold text-slate-900">Usuários</div>
                <div className="max-h-[70vh] overflow-auto">
                  {data.users.map((u: any) => (
                    <button
                      key={u.id}
                      onClick={() => loadConversation(u.id)}
                      className={`w-full text-left px-3 py-2 border-b border-slate-100 hover:bg-slate-50 ${
                        selectedUserId === u.id ? "bg-slate-100" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{u.name}</span>
                        {badge(u.type, u.type === "prestador" ? "green" : "gray")}
                      </div>
                      <div className="text-xs text-slate-600">
                        Perfil completo: {u.perfil_completo ? "Sim" : "Não"} · ID: {u.id}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="border border-slate-200 rounded-xl bg-white shadow-sm flex flex-col">
                <div className="p-3 border-b font-semibold text-slate-900">
                  {selectedUserId ? `Conversa com usuário #${selectedUserId}` : "Selecione um usuário"}
                </div>
                <div className="flex-1 overflow-auto p-3 space-y-2 bg-slate-50">
                  {loadingMessages && <p className="text-sm text-slate-600">Carregando mensagens...</p>}
                  {!loadingMessages && messages.map((m) => (
                    <div
                      key={m.message_id}
                      className={`max-w-[80%] p-2 rounded-lg text-sm ${
                        m.sender_id === adminId
                          ? "bg-slate-900 text-white ml-auto"
                          : "bg-white border border-slate-200"
                      }`}
                    >
                      {m.content}
                      <div className="text-[10px] opacity-70 mt-1">{m.createdAt}</div>
                    </div>
                  ))}
                </div>
                {selectedUserId && (
                  <form
                    className="p-3 border-t flex gap-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      contactUser(selectedUserId);
                    }}
                  >
                    <input
                      className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm"
                      placeholder="Digite sua mensagem como ArqDoor-ADM"
                      value={msgInput}
                      onChange={(e) => setMsgInput(e.target.value)}
                    />
                    <button
                      type="submit"
                      className="px-3 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold"
                    >
                      Enviar
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}

          {activeTab === "conversas" && (
            <section className="grid gap-3 md:grid-cols-3">
              {data.conversations.map((c: any) => (
                <div key={c.conversation_id} className="border border-slate-200 rounded-xl p-3 bg-white shadow-sm">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Conv #{c.conversation_id}</span>
                    <span className="text-xs text-slate-600">{c.updatedAt}</span>
                  </div>
                  <div className="mt-2 space-y-2 text-xs text-slate-700">
                    <div className="p-2 rounded-lg border border-slate-100 bg-slate-50">
                      <p className="font-semibold text-slate-900">Usuário 1</p>
                      <p>ID: {c.user1_id}</p>
                      <p>Email: {c.user1_email || "-"}</p>
                      {c.user1_provider_id ? <p>Prestador ID: {c.user1_provider_id}</p> : null}
                      {c.user1_type ? <p>Tipo: {c.user1_type}</p> : null}
                    </div>
                    <div className="p-2 rounded-lg border border-slate-100 bg-slate-50">
                      <p className="font-semibold text-slate-900">Usuário 2</p>
                      <p>ID: {c.user2_id}</p>
                      <p>Email: {c.user2_email || "-"}</p>
                      {c.user2_provider_id ? <p>Prestador ID: {c.user2_provider_id}</p> : null}
                      {c.user2_type ? <p>Tipo: {c.user2_type}</p> : null}
                    </div>
                  </div>
                </div>
              ))}
            </section>
          )}

          {activeTab === "pagamentos" && (
            <section className="grid gap-4 md:grid-cols-2">
              <div className="border border-amber-200 bg-amber-50 rounded-xl p-3 shadow-sm">
                <div className="flex justify-between items-center">
                  <p className="font-semibold text-amber-800">Pendentes</p>
                  {badge(String(data.payments.pending.length), "amber")}
                </div>
                <div className="space-y-1 max-h-56 overflow-auto">
                  {data.payments.pending.map((p: any) => (
                    <div key={`p-${p.id}`} className="border border-amber-100 rounded-lg p-2 text-xs bg-white">
                      #{p.id} · Ticket {p.ticket_id} · Step {p.step_id} · R$ {Number(p.amount || 0).toFixed(2)}
                    </div>
                  ))}
                </div>
              </div>
              <div className="border border-emerald-200 bg-emerald-50 rounded-xl p-3 shadow-sm">
                <div className="flex justify-between items-center">
                  <p className="font-semibold text-emerald-800">Pagos</p>
                  {badge(String(data.payments.paid.length), "green")}
                </div>
                <div className="space-y-1 max-h-56 overflow-auto">
                  {data.payments.paid.map((p: any) => (
                    <div key={`paid-${p.id}`} className="border border-emerald-100 rounded-lg p-2 text-xs bg-white">
                      #{p.id} · Ticket {p.ticket_id} · Step {p.step_id} · R$ {Number(p.amount || 0).toFixed(2)}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
