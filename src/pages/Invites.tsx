import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NewProposalDialog, formatIsoToBr, parseBrToIso } from "@/components/modals/NewProposalDialog";
import { formatDate, formatPrice } from "@/lib/utils";
import { Copy, ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";

type InviteStep = {
  title: string;
  price: number;
  start_date?: string | null;
  end_date?: string | null;
};

type Invite = {
  id: number;
  token: string;
  status: "draft" | "active" | "accepted" | "cancelled";
  steps: InviteStep[];
  contract_pdf_path?: string | null;
  payment_preference?: "per_step" | "at_end";
  created_at?: string;
};

type ProposalStep = {
  id: string;
  title: string;
  price: number;
  startDate?: string;
  endDate?: string;
};

const normalizeInviteSteps = (raw: unknown): InviteStep[] => {
  if (Array.isArray(raw)) return raw as InviteStep[];
  if (!raw) return [];
  if (typeof raw === "string") {
    try {
      return normalizeInviteSteps(JSON.parse(raw));
    } catch {
      return [];
    }
  }
  if (typeof raw === "object") {
    const maybe = raw as any;
    if (Array.isArray(maybe.steps)) return maybe.steps as InviteStep[];
    if (Array.isArray(maybe.data)) return maybe.data as InviteStep[];
  }
  return [];
};

const createEmptyStep = (): ProposalStep => ({
  id: Math.random().toString(36).slice(2),
  title: "",
  price: 0,
  startDate: "",
  endDate: "",
});

const toIsoDate = (value?: string | null) => {
  if (!value) return "";
  const parsed = new Date(value);
  if (isNaN(parsed.getTime())) return "";
  return parsed.toISOString().slice(0, 10);
};

const statusLabelMap: Record<Invite["status"], { label: string; tone: string }> = {
  draft: { label: "Rascunho", tone: "bg-yellow-100 text-yellow-800" },
  active: { label: "Ativo", tone: "bg-emerald-100 text-emerald-800" },
  accepted: { label: "Aceito", tone: "bg-blue-100 text-blue-800" },
  cancelled: { label: "Cancelado", tone: "bg-gray-200 text-gray-700" },
};

export default function Invites() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingInvite, setEditingInvite] = useState<Invite | null>(null);
  const [steps, setSteps] = useState<ProposalStep[]>([createEmptyStep()]);
  const [contractFile, setContractFile] = useState<File | null>(null);
  const [paymentPreference, setPaymentPreference] = useState<"per_step" | "at_end" | "custom">("at_end");
  const [saving, setSaving] = useState(false);

  const isProvider = user?.type === "prestador";

  const baseUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return window.location.origin;
  }, []);

  const loadInvites = async () => {
    try {
      setLoading(true);
      const res = await apiRequest("GET", "/invites");
      const body = await res.json().catch(() => ({}));
      if (!res.ok || body?.success === false) {
        throw new Error(body?.message || "Erro ao carregar convites.");
      }
      const normalizedInvites = Array.isArray(body.invites)
        ? body.invites.map((invite: any) => ({
            ...invite,
            steps: normalizeInviteSteps(invite?.steps),
          }))
        : [];
      setInvites(normalizedInvites);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar convites",
        description: error?.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isProvider) {
      loadInvites();
    } else {
      setLoading(false);
    }
  }, [isProvider]);

  const resetForm = () => {
    setSteps([createEmptyStep()]);
    setContractFile(null);
    setPaymentPreference("at_end");
    setEditingInvite(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (invite: Invite) => {
    const safeSteps = normalizeInviteSteps(invite.steps);
    const mappedSteps = safeSteps.map((step, idx) => ({
      id: `${invite.id}-${idx}`,
      title: step.title || "",
      price: Number(step.price) || 0,
      startDate: step.start_date ? formatIsoToBr(toIsoDate(step.start_date)) : "",
      endDate: step.end_date ? formatIsoToBr(toIsoDate(step.end_date)) : "",
    }));
    setEditingInvite(invite);
    setSteps(mappedSteps.length ? mappedSteps : [createEmptyStep()]);
    setContractFile(null);
    setPaymentPreference(invite.payment_preference || "at_end");
    setDialogOpen(true);
  };

  const handleAddStep = () => setSteps((prev) => [...prev, createEmptyStep()]);
  const handleRemoveStep = (id: string) =>
    setSteps((prev) => prev.filter((step) => step.id !== id));

  const handleUpdateStep = (
    id: string,
    field: "title" | "price" | "startDate" | "endDate",
    value: string | number
  ) => {
    setSteps((prev) =>
      prev.map((step) => (step.id === id ? { ...step, [field]: value } : step))
    );
  };

  const handleCopyLink = async (invite: Invite) => {
    const link = `${baseUrl}/convite/${invite.token}`;
    try {
      await navigator.clipboard.writeText(link);
      toast({ title: "Link copiado!", description: link });
    } catch {
      toast({
        title: "Não foi possível copiar",
        description: "Copie manualmente: " + link,
        variant: "destructive",
      });
    }
  };

  const handleDeleteInvite = async (invite: Invite) => {
    if (!window.confirm("Deseja remover este convite?")) return;
    try {
      const res = await apiRequest("DELETE", `/invites/${invite.id}`);
      const body = await res.json().catch(() => ({}));
      if (!res.ok || body?.success === false) {
        throw new Error(body?.message || "Erro ao remover convite.");
      }
      toast({ title: "Convite removido." });
      loadInvites();
    } catch (error: any) {
      toast({
        title: "Erro ao remover",
        description: error?.message || "Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleSaveInvite = async () => {
    const hasInvalidStep = steps.some(
      (step) => !step.title.trim() || Number(step.price) <= 0
    );
    if (hasInvalidStep) {
      toast({
        title: "Etapas incompletas",
        description: "Preencha título e valor de todas as etapas.",
        variant: "destructive",
      });
      return;
    }

    if (!contractFile && !editingInvite?.contract_pdf_path) {
      toast({
        title: "Contrato obrigatório",
        description: "Envie o contrato em PDF para criar o convite.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      const payloadSteps = steps.map((step) => ({
        title: step.title.trim(),
        price: Number(step.price),
        start_date: step.startDate ? parseBrToIso(step.startDate) : null,
        end_date: step.endDate ? parseBrToIso(step.endDate) : null,
      }));

      let inviteId = editingInvite?.id;

      if (editingInvite) {
        const res = await apiRequest("PUT", `/invites/${editingInvite.id}`, {
          steps: payloadSteps,
          payment_preference: paymentPreference,
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok || body?.success === false) {
          throw new Error(body?.message || "Erro ao atualizar convite.");
        }
        inviteId = body?.invite?.id || editingInvite.id;
      } else {
        const res = await apiRequest("POST", "/invites", {
          steps: payloadSteps,
          payment_preference: paymentPreference,
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok || body?.success === false) {
          throw new Error(body?.message || "Erro ao criar convite.");
        }
        inviteId = body?.invite?.id;
      }

      if (contractFile && inviteId) {
        const fd = new FormData();
        fd.append("file", contractFile);
        const pdfRes = await apiRequest("POST", `/invites/${inviteId}/pdf`, fd);
        const pdfBody = await pdfRes.json().catch(() => ({}));
        if (!pdfRes.ok || pdfBody?.success === false) {
          throw new Error(pdfBody?.message || "Erro ao anexar PDF.");
        }
      }

      toast({
        title: editingInvite ? "Convite atualizado" : "Convite criado",
        description: "O link já está pronto para compartilhar.",
      });
      setDialogOpen(false);
      resetForm();
      loadInvites();
    } catch (error: any) {
      toast({
        title: "Erro ao salvar convite",
        description: error?.message || "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (!isProvider) {
    return (
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-xl mx-auto text-center space-y-4">
          <h1 className="text-2xl font-semibold text-gray-900">Convites exclusivos para prestadores</h1>
          <p className="text-muted-foreground">
            Complete seu cadastro como prestador para gerar links de convite e enviar propostas avulsas.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-24">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Convites avulsos</h1>
          <p className="text-muted-foreground">
            Crie links rápidos para clientes externos aceitarem contratos e assinarem em poucos passos.
          </p>
        </div>
        <Button onClick={openCreateDialog} className="bg-orange-600 hover:bg-orange-700">
          <Plus className="h-4 w-4 mr-2" /> Novo convite
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Carregando convites...</p>
      ) : invites.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-8 text-center text-muted-foreground">
          Nenhum convite criado ainda. Clique em "Novo convite" para começar.
        </div>
      ) : (
        <div className="grid gap-4">
          {invites.map((invite) => {
            const statusInfo = statusLabelMap[invite.status];
            const safeSteps = normalizeInviteSteps(invite.steps);
            const total = safeSteps.reduce(
              (acc, step) => acc + (Number(step.price) || 0),
              0
            );
            return (
              <div key={invite.id} className="rounded-2xl border p-5 bg-white shadow-sm">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-semibold text-gray-900">
                        Convite #{invite.id}
                      </h2>
                      <span className={`text-xs px-2 py-1 rounded-full ${statusInfo.tone}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {invite.created_at || (invite as any)?.createdAt
                        ? `Criado em ${formatDate(invite.created_at || (invite as any).createdAt)}`
                        : "Convite pronto para compartilhar"}
                    </p>
                    <div className="text-sm text-gray-700">
                      Total: <span className="font-medium">{formatPrice(total)}</span> ·{" "}
                      {safeSteps.length} etapa(s)
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {invite.status !== "cancelled" && (
                      <Button variant="outline" onClick={() => handleCopyLink(invite)}>
                        <Copy className="h-4 w-4 mr-2" /> Copiar link
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => window.open(`/convite/${invite.token}`, "_blank")}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" /> Abrir
                    </Button>
                    {invite.status !== "accepted" && invite.status !== "cancelled" && (
                      <>
                        <Button variant="outline" onClick={() => openEditDialog(invite)}>
                          <Pencil className="h-4 w-4 mr-2" /> Editar
                        </Button>
                        <Button variant="destructive" onClick={() => handleDeleteInvite(invite)}>
                          <Trash2 className="h-4 w-4 mr-2" /> Excluir
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {!invite.contract_pdf_path && (
                  <div className="mt-3 text-xs text-orange-600">
                    Contrato ainda não anexado. Envie o PDF para ativar o convite.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <NewProposalDialog
        open={dialogOpen}
        onOpenChange={(v) => {
          setDialogOpen(v);
          if (!v) resetForm();
        }}
        dialogTitle={editingInvite ? "Editar convite" : "Novo convite"}
        dialogDescription="Defina etapas, valores e anexe o contrato em PDF para gerar um link de convite."
        submitLabel={editingInvite ? "Salvar convite" : "Criar convite"}
        proposalSteps={steps}
        onAddStep={handleAddStep}
        onRemoveStep={handleRemoveStep}
        onUpdateStep={handleUpdateStep}
        onContractFileChange={(e) => setContractFile(e.target.files?.[0] || null)}
        onSendProposal={handleSaveInvite}
        sendingProposal={saving}
        paymentPreference={paymentPreference}
        onPaymentPreferenceChange={setPaymentPreference}
      />
    </div>
  );
}
