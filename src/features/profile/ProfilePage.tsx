
// src/pages/Profile.tsx
import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AplicationLayout from "@/components/layouts/ApplicationLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  Edit2,
  Trash2,
  Mail,
  Save,
  X,
  User,
  Plus,
  Image as ImageIcon,
  Star,
} from "lucide-react";
import { ProfileHeader } from "./components/ProfileHeader";
import { ProfessionCard } from "./components/ProfessionCard";
import { DocumentsCard } from "./components/DocumentsCard";
import { AboutCard } from "./components/AboutCard";
import { ServicesSection } from "./components/ServicesSection";
import { RatingsModal } from "./components/RatingsModal";
import { PaymentPreferenceCard } from "./components/PaymentPreferenceCard";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const [services, setServices] = useState<any[]>([]);
  const [demands, setDemands] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [isCreating, setIsCreating] = useState(false);
  const [newItem, setNewItem] = useState({ title: "", description: "", price: "" });
  const [creatingItem, setCreatingItem] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [draftItem, setDraftItem] = useState<any>({});

  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // about me
  const [about, setAbout] = useState<string>("");
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [savingAbout, setSavingAbout] = useState(false);
  const [providerProfile, setProviderProfile] = useState<any | null>(null);
  const [loadingProviderInfo, setLoadingProviderInfo] = useState(false);
  const [providerError, setProviderError] = useState<string | null>(null);

  const [profession, setProfession] = useState<string>("");
  const [isEditingProfession, setIsEditingProfession] = useState(false);
  const [savingProfession, setSavingProfession] = useState(false);

  const [documentsData, setDocumentsData] = useState({ cpf: "", cnpj: "" });
  const [documentsOriginal, setDocumentsOriginal] = useState({ cpf: "", cnpj: "" });
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [savingDocuments, setSavingDocuments] = useState(false);

  const [ratingsModalOpen, setRatingsModalOpen] = useState(false);
  const [ratingsModalLoading, setRatingsModalLoading] = useState(false);
  const [ratingsModalData, setRatingsModalData] = useState<{ average: number; count: number; list: any[] } | null>(null);

  // payment preference
  const [paymentPreference, setPaymentPreference] = useState<"per_step" | "at_end" | null>(null);
  const [savingPaymentPreference, setSavingPaymentPreference] = useState(false);


  // === função para salvar/editar o "Sobre mim" ===
  const handleSaveAbout = async () => {
    if (!user) return;
    if (user.type !== "prestador") {
      toast({
        title: "Recurso indisponível",
        description: "A seção 'Sobre mim' está disponível apenas para prestadores.",
        variant: "destructive",
      });
      return;
    }
    if (!providerProfile) {
      toast({
        title: "Prestador não encontrado",
        description: "Não foi possível carregar seus dados. Atualize a página.",
        variant: "destructive",
      });
      return;
    }
    setSavingAbout(true);
    try {
      const payload = { about };
      const endpoint = `/providers/${providerProfile.provider_id}`;

      const res = await apiRequest("PUT", endpoint, payload);
      const body = await res.json().catch(() => ({}));
      if (!res.ok || body?.success === false) {
        throw new Error(body?.message || `Erro ao salvar: ${res.status}`);
      }

      setProviderProfile((prev: any) =>
        prev ? { ...prev, about } : prev
      );
      toast({ title: "Sucesso", description: "Sobre mim atualizado!" });
      setIsEditingAbout(false);
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setSavingAbout(false);
    }
  };

  const sanitizeCpf = (value: string) => value.replace(/[^0-9]/g, "").slice(0, 11);
  const sanitizeCnpj = (value: string) => value.replace(/[^0-9]/g, "").slice(0, 14);

  const loadProviderInfo = useCallback(async () => {
    if (!user || user.type !== "prestador") {
      setProviderProfile(null);
      setAbout("");
      setPaymentPreference(null);
      return;
    }
    try {
      setLoadingProviderInfo(true);
      setProviderError(null);
      const res = await apiRequest("GET", `/providers/user/${user.id}`);
      if (!res.ok) {
        throw new Error("Não foi possível carregar os dados do prestador");
      }
      const body = await res.json();
      setProviderProfile(body.provider);
      setAbout(body.provider?.about || "");
      setProfession(body.provider?.profession || "");
      setPaymentPreference(body.provider?.payment_preference || "per_step");
    } catch (error: any) {
      setProviderError(error?.message || "Falha ao carregar dados do prestador");
      setProviderProfile(null);
      setAbout("");
      setProfession("");
      setPaymentPreference(null);
    } finally {
      setLoadingProviderInfo(false);
    }
  }, [user]);

  useEffect(() => {
    loadProviderInfo();
  }, [loadProviderInfo]);

  const loadDocumentsData = useCallback(async () => {
    if (!user?.id) return;
    setLoadingDocuments(true);
    try {
      const res = await apiRequest("GET", `/users/${user.id}`);
      if (!res.ok) return;
      const body = await res.json();
      const next = {
        cpf: body?.user?.cpf || "",
        cnpj: body?.user?.cnpj || "",
      };
      setDocumentsData(next);
      setDocumentsOriginal(next);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingDocuments(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadDocumentsData();
  }, [loadDocumentsData]);

  const documentsChanged =
    documentsData.cpf !== documentsOriginal.cpf ||
    documentsData.cnpj !== documentsOriginal.cnpj;

  const handleSaveProfession = async () => {
    if (!user || user.type !== "prestador" || !providerProfile) return;
    if (!profession.trim()) {
      toast({
        title: "Profissão obrigatória",
        description: "Informe sua profissão.",
        variant: "destructive",
      });
      return;
    }
    setSavingProfession(true);
    try {
      const payload = { profession: profession.trim() };
      const endpoint = `/providers/${providerProfile.provider_id}`;
      const res = await apiRequest("PUT", endpoint, payload);
      const body = await res.json().catch(() => ({}));
      if (!res.ok || body?.success === false) {
        throw new Error(body?.message || "Não foi possível atualizar a profissão");
      }
      setProviderProfile((prev: any) =>
        prev ? { ...prev, profession: profession.trim() } : prev
      );
      toast({ title: "Profissão atualizada" });
      setIsEditingProfession(false);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error?.message || "Falha ao salvar a profissão",
        variant: "destructive",
      });
    } finally {
      setSavingProfession(false);
    }
  };

  const handleSavePaymentPreference = async () => {
    if (!user || user.type !== "prestador" || !providerProfile) return;
    if (!paymentPreference) {
      toast({
        title: "Erro",
        description: "Selecione uma preferência de pagamento",
        variant: "destructive",
      });
      return;
    }
    setSavingPaymentPreference(true);
    try {
      const payload = { payment_preference: paymentPreference };
      const endpoint = `/providers/${providerProfile.provider_id}`;
      const res = await apiRequest("PUT", endpoint, payload);
      const body = await res.json().catch(() => ({}));
      if (!res.ok || body?.success === false) {
        throw new Error(body?.message || "Não foi possível atualizar a preferência de pagamento");
      }
      setProviderProfile((prev: any) =>
        prev ? { ...prev, payment_preference: paymentPreference } : prev
      );
      toast({ 
        title: "Sucesso",
        description: `Preferência de pagamento alterada para: ${paymentPreference === "per_step" ? "Por Etapa" : "Na Conclusão"}` 
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error?.message || "Falha ao salvar a preferência de pagamento",
        variant: "destructive",
      });
    } finally {
      setSavingPaymentPreference(false);
    }
  };

  const handleSaveDocuments = async () => {
    if (!user) return;
    setSavingDocuments(true);
    try {
      const payload: Record<string, string | null> = {
        cpf: documentsData.cpf || null,
        cnpj: documentsData.cnpj || null,
      };

      const res = await apiRequest("PUT", `/users/${user.id}`, payload);
      const body = await res.json().catch(() => ({}));
      if (!res.ok || body?.success === false) {
        throw new Error(body?.message || "Não foi possível atualizar os documentos");
      }

      setDocumentsOriginal({ ...documentsData });
      toast({
        title: "Dados atualizados",
        description: "Seu CPF/CNPJ será usado apenas para pagamentos internos",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error?.message || "Não foi possível salvar os documentos",
        variant: "destructive",
      });
    } finally {
      setSavingDocuments(false);
    }
  };

  const handleCancelDocuments = () => {
    setDocumentsData(documentsOriginal);
  };

  const providerProfileId = providerProfile?.provider_id ?? providerProfile?.id_provider ?? null;

  const handleOpenRatingsModal = async () => {
    if (!providerProfileId) return;
    setRatingsModalOpen(true);
    setRatingsModalLoading(true);
    try {
      const res = await apiRequest("GET", `/providers/${providerProfileId}/ratings`);
      if (!res.ok) throw new Error("Não foi possível carregar as avaliações");
      const data = await res.json();
      setRatingsModalData({
        average: data.average || 0,
        count: data.count || 0,
        list: data.ratings || [],
      });
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Erro ao carregar avaliações",
        description: error?.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setRatingsModalLoading(false);
    }
  };

  // === Load ===
  const loadItems = async () => {
    if (!user) return;
    setLoading(true);
    try {
      if (user.type === "prestador") {
        const res = await apiRequest("GET", "/servicesfreelancer");
        const body = await res.json();
        setServices(body.servicesFreelancer || []);
      } else {
        const res = await apiRequest("GET", "/demands");
        const body = await res.json();
        setDemands(body.demands || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
    if (user?.type === "prestador") loadPortfolio();
  }, [user]);

  const loadPortfolio = async () => {
    if (!user) return;
    try {
      const res = await apiRequest("GET", `/portfolio?user=${user.id}`);
      if (res.ok) {
        const body = await res.json();
        setPortfolio(body.posts || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // === CRUD ===
  const handleCreate = async () => {
    if (!user) return;
    if (!newItem.title || !newItem.description) return;
    setCreatingItem(true);
    try {
      const payload = { ...newItem, price: parseFloat(newItem.price) || 0, user_id: user.id };
      const endpoint = user.type === "prestador" ? "/servicesfreelancer" : "/demands";
      const res = await apiRequest("POST", endpoint, payload);
      if (newItem.description.length < 30) {
        toast({
          title: "Poucos caracteres na descrição",
          description: "A descrição precisa ter pelo menos 30 caracteres",
          variant: "destructive"
        });
        return;
      }
      if (newItem.price.toString().length < 1) {
        toast({
          title: "Preço inválido",
          description: "O preço precisa ser maior que zero",
          variant: "destructive"
        });
        return;
      }
      const sla = await res.json();
      // verificar se é prestador pra mandar mensagem de criação
      const messageType = user.type === "prestador" ? "service" : "demand";
      if (sla.id) {
        await apiRequest("POST", `/messages/${sla.id}`, { type: messageType });
      }
      console.log(sla)
      if (res.ok) {
        toast({
          title: "Sucesso",
          description: `${messageType} criado com sucesso!`,
          variant: "default",
        });
        setNewItem({ title: "", description: "", price: "" });
        setIsCreating(false);
        loadItems();
      }
    } finally {
      setCreatingItem(false);
    }
  };

  const handleUpdate = async (id: number) => {
    if (!user) return;
    try {
      const endpoint =
        user.type === "prestador"
          ? `/servicesfreelancer/${id}`
          : `/demands/${id}`;
      const res = await apiRequest("PUT", endpoint, draftItem);
      if (res.ok) {
        toast({ title: "Atualizado", description: "Item editado com sucesso!" });
        setEditingId(null);
        setDraftItem({});
        loadItems();
      }
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    if (!user) return;
    try {
      const endpoint =
        user.type === "prestador"
          ? `/servicesfreelancer/${id}`
          : `/demands/${id}`;
      const res = await apiRequest("DELETE", endpoint);
      if (res.ok) {
        toast({ title: "Removido", description: "Item deletado com sucesso!" });
        loadItems();
      }
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  };

  if (!user) {
    return (
      <AplicationLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </AplicationLayout>
    );
  }

  return (
    <AplicationLayout>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <ProfileHeader user={user as any} onLogout={logout} />

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Coluna Esquerda: Informações, Sobre, Profissão */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informações Pessoais</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" /> {user.name}
                  </div>
              <Separator className="my-3" />
                  {user.type !== "prestador" && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" /> Email: {user.email || "Não informado"}
                    </div>
                  )}
                </CardContent>
              </Card>

              {user.type === "prestador" && (
                <>
                  <AboutCard
                    about={about}
                    isEditing={isEditingAbout}
                    setIsEditing={setIsEditingAbout}
                    setAbout={setAbout}
                    loading={loadingProviderInfo}
                    error={providerError}
                    saving={savingAbout}
                    providerProfile={providerProfile}
                    onSave={handleSaveAbout}
                  />
                  <ProfessionCard
                    profession={profession}
                    isEditing={isEditingProfession}
                    setIsEditing={setIsEditingProfession}
                    setProfession={setProfession}
                    saving={savingProfession}
                    providerProfile={providerProfile}
                    onSave={handleSaveProfession}
                  />
                  <PaymentPreferenceCard
                    paymentPreference={paymentPreference}
                    onChange={setPaymentPreference}
                    loading={loadingProviderInfo}
                    saving={savingPaymentPreference}
                    onSave={handleSavePaymentPreference}
                  />
                </>
              )}
            </div>

            {/* Coluna Meio: Serviços e Portfólio */}
            <div className="space-y-6">
              <ServicesSection
                userType={user.type}
                serviceItems={user.type === "prestador" ? services : demands}
                loading={loading}
                editingId={editingId}
                draftItem={draftItem}
                setDraftItem={setDraftItem}
                setEditingId={setEditingId}
                handleUpdate={(id) => handleUpdate(id)}
                handleDelete={(id) => handleDelete(id)}
                isCreating={isCreating}
                setIsCreating={setIsCreating}
                newItem={newItem as any}
                setNewItem={setNewItem}
                handleCreate={handleCreate}
                creatingItem={creatingItem}
              />

              {user.type === "prestador" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Portfólio</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {portfolio.length === 0 ? (
                      <div className="text-slate-500 text-center">
                        Nenhum item de portfólio
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {portfolio.map((item) => (
                          <div
                            key={item.id}
                            className="border rounded-lg p-2 cursor-pointer hover:shadow"
                          >
                            <ImageIcon className="w-6 h-6 text-slate-400 mx-auto" />
                            <p className="text-sm mt-2 text-center">{item.title}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    <Button
                      onClick={() => setIsUploadingImage(true)}
                      className="w-full mt-4 bg-gradient-to-r from-orange-500 to-amber-600 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" /> Novo Destaque
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Coluna Direita: Avaliações (botão/modal) e Documentos */}
            <div className="space-y-6">
              {user.type === "prestador" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Avaliações</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold">{ratingsModalData?.average?.toFixed(1) || "--"}</p>
                        <p className="text-sm text-slate-500">
                          {ratingsModalData?.count ?? 0} avaliação{(ratingsModalData?.count ?? 0) !== 1 ? "es" : ""}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        className="bg-orange-600 text-white"
                        disabled={!providerProfileId}
                        onClick={handleOpenRatingsModal}
                      >
                        Ver avaliações
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <DocumentsCard
                data={documentsData}
                onChangeCpf={(value) =>
                  setDocumentsData((prev) => ({
                    ...prev,
                    cpf: sanitizeCpf(value),
                  }))
                }
                onChangeCnpj={(value) =>
                  setDocumentsData((prev) => ({
                    ...prev,
                    cnpj: sanitizeCnpj(value),
                  }))
                }
                loading={loadingDocuments}
                saving={savingDocuments}
                changed={documentsChanged}
                onSave={handleSaveDocuments}
                onCancel={handleCancelDocuments}
              />
            </div>
          </div>
        </div>
      </div>
      <RatingsModal
        open={ratingsModalOpen}
        onOpenChange={(open) => {
          setRatingsModalOpen(open);
          if (!open) {
            setRatingsModalData(null);
          } else if (!ratingsModalData && providerProfileId) {
            handleOpenRatingsModal();
          }
        }}
        loading={ratingsModalLoading}
        data={ratingsModalData}
        onReload={handleOpenRatingsModal}
        providerProfileId={providerProfileId}
      />
    </AplicationLayout>
  );
}
