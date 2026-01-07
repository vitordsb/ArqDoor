import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "wouter";
import { apiRequest, API_BASE_URL } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatDate, formatPrice } from "@/lib/utils";
import { FileText, Loader2 } from "lucide-react";
import { AuthModals } from "@/components/modals/AuthModals";

type InviteStep = {
  title: string;
  price: number;
  start_date?: string | null;
  end_date?: string | null;
};

type InviteData = {
  id: number;
  token: string;
  status: "draft" | "active" | "accepted" | "cancelled";
  steps: InviteStep[];
  contract_pdf_path?: string | null;
  payment_preference?: "per_step" | "at_end";
  created_at?: string;
};

export default function InvitePublic() {
  const { token } = useParams<{ token: string }>();
  const [, navigate] = useLocation();
  const { user, isLoggedIn, updateUserLocal } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [invite, setInvite] = useState<InviteData | null>(null);
  const [provider, setProvider] = useState<any>(null);
  const [cpfInput, setCpfInput] = useState("");
  const [savingCpf, setSavingCpf] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [pendingAccept, setPendingAccept] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  useEffect(() => {
    const fetchInvite = async () => {
      try {
        setLoading(true);
        const res = await apiRequest("GET", `/invites/public/${token}`);
        const body = await res.json().catch(() => ({}));
        if (!res.ok || body?.success === false) {
          throw new Error(body?.message || "Convite não encontrado.");
        }
        setInvite(body.invite);
        setProvider(body.provider || null);
      } catch (error: any) {
        toast({
          title: "Convite indisponível",
          description: error?.message || "Verifique o link.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchInvite();
    }
  }, [token, toast]);

  const pdfUrl = useMemo(() => {
    if (!invite?.contract_pdf_path) return "";
    if (invite.contract_pdf_path.startsWith("http")) return invite.contract_pdf_path;
    return `${API_BASE_URL}/${invite.contract_pdf_path.replace(/^\/+/, "")}`;
  }, [invite]);

  const total = useMemo(() => {
    return (invite?.steps || []).reduce((acc, step) => acc + (Number(step.price) || 0), 0);
  }, [invite]);

  const cpfDigits = (user?.cpf || "").toString().replace(/\D/g, "");
  const needsCpf = isLoggedIn && cpfDigits.length !== 11;
  const inviteUnavailable = invite?.status && invite.status !== "active";

  const handleSaveCpf = async () => {
    const digits = cpfInput.replace(/\D/g, "").slice(0, 11);
    if (digits.length !== 11) {
      toast({
        title: "CPF inválido",
        description: "Informe os 11 dígitos do CPF.",
        variant: "destructive",
      });
      return;
    }
    try {
      setSavingCpf(true);
      const res = await apiRequest("PUT", `/users/${user?.id}`, { cpf: digits });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || body?.success === false) {
        throw new Error(body?.message || "Erro ao salvar CPF.");
      }
      updateUserLocal({ cpf: digits });
      toast({ title: "CPF salvo com sucesso." });
    } catch (error: any) {
      toast({
        title: "Erro ao salvar CPF",
        description: error?.message || "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSavingCpf(false);
    }
  };

  const handleAccept = async () => {
    if (!isLoggedIn) {
      setPendingAccept(true);
      setRegisterOpen(true);
      return;
    }
    if (needsCpf) {
      toast({
        title: "CPF obrigatório",
        description: "Informe o CPF antes de assinar o contrato.",
        variant: "destructive",
      });
      return;
    }

    try {
      setAccepting(true);
      const res = await apiRequest("POST", `/invites/public/${token}/accept`, {});
      const body = await res.json().catch(() => ({}));
      if (!res.ok || body?.success === false) {
        throw new Error(body?.message || "Erro ao aceitar convite.");
      }
      toast({
        title: "Contrato assinado!",
        description: "Você já pode conversar com o prestador.",
      });
      if (body?.data?.provider_user_id) {
        navigate(`/messages/${body.data.provider_user_id}?ticket=${body.data.ticket_id}&view=contract`);
      }
    } catch (error: any) {
      toast({
        title: "Falha ao assinar",
        description: error?.message || "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setAccepting(false);
    }
  };

  useEffect(() => {
    if (!pendingAccept || !isLoggedIn) return;
    if (needsCpf) return;
    setPendingAccept(false);
    handleAccept();
  }, [pendingAccept, isLoggedIn, needsCpf, handleAccept]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-24 text-center text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin inline-block mr-2" />
        Carregando convite...
      </div>
    );
  }

  if (!invite) {
    return (
      <div className="container mx-auto px-4 py-24 text-center text-muted-foreground">
        Convite não encontrado.
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-24">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="rounded-3xl border bg-white shadow-sm p-6 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Convite #{invite.id}
              </h1>
              <p className="text-sm text-muted-foreground">
                {invite.created_at || (invite as any)?.createdAt
                  ? `Criado em ${formatDate(invite.created_at || (invite as any).createdAt)}`
                  : "Convite ativo"}
              </p>
            </div>
            <Badge variant="outline">
              {invite.payment_preference === "at_end"
                ? "Depósito em garantia"
                : "Pagamento por etapa"}
            </Badge>
          </div>

          {provider?.user && (
            <div className="text-sm text-muted-foreground">
              Prestador: <span className="font-medium text-gray-900">{provider.user.name}</span>{" "}
              {provider.profession ? `· ${provider.profession}` : ""}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-700">
            <span>Total: <strong>{formatPrice(total)}</strong></span>
            <span>Etapas: <strong>{invite.steps?.length || 0}</strong></span>
          </div>

          {invite.contract_pdf_path ? (
            <Button variant="outline" onClick={() => window.open(pdfUrl, "_blank")}>
              <FileText className="h-4 w-4 mr-2" /> Ver contrato em PDF
            </Button>
          ) : (
            <p className="text-sm text-orange-600">
              Este convite ainda não possui contrato anexado.
            </p>
          )}
        </div>

        <div className="rounded-3xl border bg-white shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Etapas do contrato</h2>
          <div className="space-y-3">
            {(invite.steps || []).map((step, idx) => (
              <div key={`${step.title}-${idx}`} className="rounded-2xl border p-4">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="font-medium text-gray-900">Etapa {idx + 1}</p>
                    <p className="text-sm text-muted-foreground">{step.title}</p>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {formatPrice(Number(step.price) || 0)}
                  </span>
                </div>
                {(step.start_date || step.end_date) && (
                  <div className="text-xs text-muted-foreground mt-2">
                    {step.start_date ? `Início: ${formatDate(step.start_date)}` : ""}
                    {step.end_date ? ` · Fim: ${formatDate(step.end_date)}` : ""}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border bg-white shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Assinatura</h2>

          {inviteUnavailable ? (
            <p className="text-sm text-muted-foreground">
              {invite.status === "accepted"
                ? "Este convite já foi utilizado."
                : "Este convite não está mais disponível."}
            </p>
          ) : !invite.contract_pdf_path ? (
            <p className="text-sm text-muted-foreground">
              O contrato ainda não foi anexado pelo prestador.
            </p>
          ) : !isLoggedIn ? (
            <>
              <p className="text-sm text-muted-foreground">
                Faça login ou cadastro (Google ou e-mail) para assinar o contrato.
              </p>
              <Button
                onClick={() => {
                  setPendingAccept(true);
                  setRegisterOpen(true);
                }}
                className="bg-orange-600 hover:bg-orange-700"
              >
                Criar conta para assinar
              </Button>
            </>
          ) : needsCpf ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Informe seu CPF para continuar com a assinatura.
              </p>
              <div className="flex flex-col md:flex-row gap-3">
                <Input
                  placeholder="CPF (somente números)"
                  value={cpfInput}
                  onChange={(e) => setCpfInput(e.target.value)}
                />
                <Button onClick={handleSaveCpf} disabled={savingCpf}>
                  {savingCpf ? "Salvando..." : "Salvar CPF"}
                </Button>
              </div>
            </div>
          ) : (
            <Button onClick={handleAccept} disabled={accepting} className="bg-orange-600 hover:bg-orange-700">
              {accepting ? "Assinando..." : "Assinar contrato"}
            </Button>
          )}
        </div>
      </div>

      <AuthModals
        isLoginOpen={loginOpen}
        isRegisterOpen={registerOpen}
        onLoginClose={() => {
          setLoginOpen(false);
          setPendingAccept(false);
        }}
        onRegisterClose={() => {
          setRegisterOpen(false);
          setPendingAccept(false);
        }}
        onSuccess={() => {
          setLoginOpen(false);
          setRegisterOpen(false);
        }}
        onSwitchToRegister={() => {
          setLoginOpen(false);
          setRegisterOpen(true);
        }}
        onSwitchToLogin={() => {
          setRegisterOpen(false);
          setLoginOpen(true);
        }}
        autoLoginAfterRegister
      />
    </div>
  );
}
