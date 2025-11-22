
// src/pages/Profile.tsx
import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import AplicationLayout from "@/components/layouts/ApplicationLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Loader2,
  Edit2,
  Trash2,
  Mail,
  Save,
  X,
  LogOut,
  User,
  MapPin,
  Briefcase,
  Plus,
  Image as ImageIcon,
} from "lucide-react";

export default function Profile() {
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

  const [documentsData, setDocumentsData] = useState({ cpf: "", cnpj: "" });
  const [documentsOriginal, setDocumentsOriginal] = useState({ cpf: "", cnpj: "" });
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [savingDocuments, setSavingDocuments] = useState(false);

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
    } catch (error: any) {
      setProviderError(error?.message || "Falha ao carregar dados do prestador");
      setProviderProfile(null);
      setAbout("");
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
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <Card className="shadow-xl border-0 rounded-3xl bg-white/80 backdrop-blur-sm overflow-hidden">
            <div className="relative">
              <div className="h-32 bg-gradient-to-r from-orange-400 via-amber-500 to-yellow-400"></div>
              <div className="absolute -bottom-16 left-8">
                <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              </div>
            </div>
            <CardContent className="pt-20 pb-8 flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">{user.name}</h1>
                <p className="text-slate-600">
                  {user.type === "prestador" ? "Prestador de Serviços" : "Cliente"}
                </p>
              </div>
              <Button variant="outline" onClick={logout}>
                <LogOut className="w-4 h-4 mr-2" /> Sair
              </Button>
            </CardContent>
          </Card>

          {/* Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Esquerda */}
            <div className="md:col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informações Pessoais</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" /> {user.name}
                  </div>
                  <Separator className="my-3" />
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" /> Email: {user.email || "Não informado"}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Sobre mim</CardTitle>
                </CardHeader>
                <CardContent>
                  {user.type !== "prestador" ? (
                    <p className="text-sm text-slate-500">
                      Apenas prestadores podem definir uma descrição pública no momento.
                    </p>
                  ) : loadingProviderInfo ? (
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Carregando descrição...
                    </div>
                  ) : providerError ? (
                    <p className="text-sm text-red-600">{providerError}</p>
                  ) : isEditingAbout ? (
                    <div className="space-y-3">
                      <Textarea
                        value={about}
                        onChange={(e) => setAbout(e.target.value)}
                        rows={4}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={handleSaveAbout}
                          disabled={savingAbout || !providerProfile}
                          className="bg-green-600 text-white"
                        >
                          {savingAbout ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          ) : (
                            <Save className="w-4 h-4 mr-2" />
                          )}
                          {savingAbout ? "Salvando..." : "Salvar"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setIsEditingAbout(false)}
                        >
                          <X className="w-4 h-4 mr-1" /> Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <p className="text-slate-700">
                        {about && about.trim() !== "" ? about : "Nenhum 'Sobre mim' cadastrado ainda."}
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsEditingAbout(true)}
                        className="w-fit"
                      >
                        <Edit2 className="w-4 h-4 mr-1" />{" "}
                        {about && about.trim() !== "" ? "Editar" : "Adicionar"}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Documentos para pagamento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {loadingDocuments ? (
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Loader2 className="w-4 h-4 animate-spin" /> Carregando dados...
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">CPF</label>
                        <Input
                          value={documentsData.cpf}
                          onChange={(e) =>
                            setDocumentsData((prev) => ({
                              ...prev,
                              cpf: sanitizeCpf(e.target.value),
                            }))
                          }
                          placeholder="Somente números"
                          maxLength={14}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">CNPJ</label>
                        <Input
                          value={documentsData.cnpj}
                          onChange={(e) =>
                            setDocumentsData((prev) => ({
                              ...prev,
                              cnpj: sanitizeCnpj(e.target.value),
                            }))
                          }
                          placeholder="Somente números"
                          maxLength={18}
                        />
                      </div>
                      <p className="text-xs text-slate-500">
                        Essas informações são usadas apenas para processar pagamentos e não são exibidas para outros usuários.
                      </p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="bg-orange-600 text-white"
                          onClick={handleSaveDocuments}
                          disabled={!documentsChanged || savingDocuments}
                        >
                          {savingDocuments ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          ) : (
                            <Save className="w-4 h-4 mr-2" />
                          )}
                          Salvar documentos
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancelDocuments}
                          disabled={!documentsChanged || savingDocuments}
                        >
                          <X className="w-4 h-4 mr-1" /> Cancelar
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Direita */}
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {user.type === "prestador" ? "Meus Serviços" : "Minhas Demandas"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <div className="space-y-4">
                      {(user.type === "prestador" ? services : demands).map((item) => (
                        <div
                          key={item.id_serviceFreelancer || item.id_demand}
                          className="p-4 border rounded-lg space-y-2"
                        >
                          {editingId === (item.id_serviceFreelancer || item.id_demand) ? (
                            <>
                              <Input
                                value={draftItem.title}
                                onChange={(e) =>
                                  setDraftItem({ ...draftItem, title: e.target.value })
                                }
                                className="mb-2"
                              />
                              <Textarea
                                value={draftItem.description}
                                onChange={(e) =>
                                  setDraftItem({ ...draftItem, description: e.target.value })
                                }
                                className="mb-2"
                              />
                              {user.type === "prestador" && (
                                <Input
                                  type="number"
                                  value={draftItem.price}
                                  onChange={(e) =>
                                    setDraftItem({ ...draftItem, price: e.target.value })
                                  }
                                  className="mb-2"
                                />
                              )}
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    handleUpdate(item.id_serviceFreelancer || item.id_demand)
                                  }
                                >
                                  <Save className="w-4 h-4 mr-1" /> Salvar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setEditingId(null)}
                                >
                                  <X className="w-4 h-4 mr-1" /> Cancelar
                                </Button>
                              </div>
                            </>
                          ) : (
                            <>
                              <h4 className="font-semibold">{item.title}</h4>
                              <p>{item.description}</p>
                              {item.price && (
                                <p className="text-orange-600 font-bold">R$ {item.price}</p>
                              )}
                              <div className="flex gap-2 mt-2">
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setEditingId(item.id_serviceFreelancer || item.id_demand);
                                    setDraftItem(item);
                                  }}
                                >
                                  <Edit2 className="w-4 h-4 mr-1" /> Editar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() =>
                                    handleDelete(item.id_serviceFreelancer || item.id_demand)
                                  }
                                >
                                  <Trash2 className="w-4 h-4 mr-1" /> Remover
                                </Button>
                              </div>
                            </>
                          )}
                        </div>
                      ))}

                      <Button
                        onClick={() => setIsCreating(!isCreating)}
                        className="w-full bg-gradient-to-r from-orange-500 to-amber-600 text-white"
                      >
                        <Plus className="w-4 h-4 mr-2" />{" "}
                        {isCreating
                          ? "Cancelar"
                          : user.type === "prestador"
                            ? "Novo Serviço"
                            : "Nova Demanda"}
                      </Button>

                      {isCreating && (
                        <div className="space-y-3 mt-4 p-4 border rounded-lg bg-slate-50">
                          <Input
                            placeholder="Título"
                            value={newItem.title}
                            onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                          />
                          <Textarea
                            placeholder="Descrição"
                            value={newItem.description}
                            onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                          />
                          {user.type === "prestador" && (
                            <Input
                              type="number"
                              placeholder="Preço"
                              value={newItem.price}
                              onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                            />
                          )}
                          <Button onClick={handleCreate} disabled={creatingItem} className="w-full">
                            {creatingItem ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Save className="w-4 h-4 mr-1" />
                            )}
                            {creatingItem ? "Salvando..." : "Salvar"}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Portfólio */}
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
          </div>
        </div>
      </div>
    </AplicationLayout>
  );
}
