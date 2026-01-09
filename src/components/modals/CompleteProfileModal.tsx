import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";

const digitsOnly = (value: string) => value.replace(/\D/g, "");

const normalizeDate = (value?: string) => {
  if (!value) return "";
  const trimmed = value.split("T")[0];
  return trimmed === "1970-01-01" ? "" : trimmed;
};

export default function CompleteProfileModal() {
  const {
    user,
    isLoggedIn,
    needsOnboarding,
    setNeedsOnboarding,
    onboardingOptional,
    setOnboardingOptional,
    updateUserLocal,
  } = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const [gender, setGender] = useState(user?.gender || "");
  const [birth, setBirth] = useState(normalizeDate(user?.birth));
  const [isPrestador, setIsPrestador] = useState(user?.type === "prestador");
  const [hasCnpj, setHasCnpj] = useState(!!user?.cnpj);
  const [cpf, setCpf] = useState(user?.cpf || "");
  const [cnpj, setCnpj] = useState(user?.cnpj || "");
  const [cep, setCep] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [typeLocation, setTypeLocation] = useState("Residencial");
  const [cepLoading, setCepLoading] = useState(false);

  const shouldOpen = isLoggedIn && needsOnboarding && !!user?.id;
  const canSkip = onboardingOptional;

  const cleanedCpf = useMemo(() => digitsOnly(cpf), [cpf]);
  const cleanedCnpj = useMemo(() => digitsOnly(cnpj), [cnpj]);
  const cleanedCep = useMemo(() => digitsOnly(cep), [cep]);

  const showError = (message: string) => {
    toast({
      title: "Complete seu cadastro",
      description: message,
      variant: "destructive",
    });
  };

  const needsDocuments = isPrestador && !(user?.cpf || user?.cnpj);
  const shouldAskIdentity = !onboardingOptional;

  const validate = () => {
    if (shouldAskIdentity) {
      if (!gender) return showError("Selecione o gênero.");
      if (!birth) return showError("Informe a data de nascimento.");
    }
    if (cleanedCep.length !== 8) return showError("Informe um CEP válido (8 dígitos).");
    if (state.trim().length !== 2) return showError("Informe o estado com 2 letras (UF).");
    if (!city.trim()) return showError("Informe a cidade.");
    if (!number.trim()) return showError("Informe o número.");

    if (isPrestador && (!onboardingOptional || needsDocuments)) {
      if (hasCnpj && cleanedCnpj.length !== 14) {
        return showError("Informe um CNPJ válido (14 dígitos).");
      }
      if (!hasCnpj && cleanedCpf && cleanedCpf.length !== 11) {
        return showError("Informe um CPF válido (11 dígitos) ou marque CNPJ.");
      }
    }
    return true;
  };

  useEffect(() => {
    if (cleanedCep.length !== 8) return;
    let cancelled = false;
    const controller = new AbortController();
    const fetchCep = async () => {
      try {
        setCepLoading(true);
        const response = await fetch(`https://viacep.com.br/ws/${cleanedCep}/json/`, {
          signal: controller.signal,
        });
        const data = await response.json();
        if (cancelled) return;
        if (data?.erro) {
          showError("CEP não encontrado.");
          return;
        }
        if (data?.uf) setState(data.uf);
        if (data?.localidade) setCity(data.localidade);
        if (data?.bairro !== undefined) setNeighborhood(data.bairro);
        if (data?.logradouro !== undefined) setStreet(data.logradouro);
      } catch (err) {
        if (!cancelled) {
          showError("Falha ao consultar o CEP.");
        }
      } finally {
        if (!cancelled) setCepLoading(false);
      }
    };

    const timeout = setTimeout(fetchCep, 350);
    return () => {
      cancelled = true;
      controller.abort();
      clearTimeout(timeout);
    };
  }, [cleanedCep]);

  const handleSubmit = async () => {
    if (!user?.id) return;
    if (!validate()) return;

    setIsSaving(true);
    try {
      const finalType = onboardingOptional
        ? user?.type || "contratante"
        : (isPrestador ? "prestador" : "contratante");
      const userPayload: Record<string, any> = {
        type: finalType,
        perfil_completo: true,
      };
      if (shouldAskIdentity || gender) userPayload.gender = gender;
      if (shouldAskIdentity || birth) userPayload.birth = birth;
      if (cleanedCpf) userPayload.cpf = cleanedCpf;
      if (cleanedCnpj) userPayload.cnpj = cleanedCnpj;

      const updateUserRes = await apiRequest("PUT", `/users/${user.id}`, userPayload);
      if (!updateUserRes.ok) {
        const errorBody = await updateUserRes.json().catch(() => null);
        throw new Error(errorBody?.message || "Falha ao atualizar dados do usuário.");
      }

      if (finalType === "prestador") {
        const providerRes = await apiRequest("POST", "/providers", { user_id: user.id });
        if (!providerRes.ok) {
          const errorBody = await providerRes.json().catch(() => null);
          throw new Error(errorBody?.message || "Falha ao criar perfil de prestador.");
        }
      }

      const locationPayload: Record<string, any> = {
        cep: cleanedCep,
        state: state.toUpperCase(),
        city: city.trim(),
        neighborhood: neighborhood.trim() || undefined,
        street: street.trim() || undefined,
        number: number ? Number(number) : undefined,
        typeLocation,
      };
      const locationRes = await apiRequest("POST", "/locationuser", locationPayload);
      if (!locationRes.ok) {
        const errorBody = await locationRes.json().catch(() => null);
        throw new Error(errorBody?.message || "Falha ao salvar endereço.");
      }

      updateUserLocal({
        gender,
        birth,
        type: finalType as "prestador" | "contratante",
        cpf: cleanedCpf || undefined,
        cnpj: cleanedCnpj || undefined,
        perfil_completo: true,
      });

      setNeedsOnboarding(false);
      setOnboardingOptional(false);
      toast({
        title: "Cadastro completo",
        description: "Seus dados foram salvos com sucesso.",
      });
    } catch (err) {
      console.error(err);
      showError((err as Error).message || "Falha ao salvar seus dados.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && canSkip) {
      setNeedsOnboarding(false);
      setOnboardingOptional(false);
    }
  };

  return (
    <Dialog open={shouldOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Complete seu cadastro</DialogTitle>
          <DialogDescription>
            Para continuar, confirme seus dados e informe endereço. Alguns campos não vêm do Google.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm">Nome</label>
            <Input value={user?.name || ""} disabled className="mt-1" />
          </div>
          <div>
            <label className="text-sm">E-mail</label>
            <Input value={user?.email || ""} disabled className="mt-1" />
          </div>
          {shouldAskIdentity ? (
            <>
              <div>
                <label className="text-sm">Gênero</label>
                <select
                  className="mt-1 w-full rounded-md border bg-background p-2"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
                  <option value="" disabled>
                    Selecione...
                  </option>
                  <option value="Masculino">Masculino</option>
                  <option value="Feminino">Feminino</option>
                  <option value="Prefiro não dizer">Prefiro não dizer</option>
                </select>
              </div>
              <div>
                <label className="text-sm">Data de nascimento</label>
                <Input
                  type="date"
                  value={birth}
                  onChange={(e) => setBirth(e.target.value)}
                  className="mt-1"
                />
              </div>
            </>
          ) : null}
        </div>

        {!onboardingOptional ? (
          <div className="mt-4 flex items-center gap-3 rounded-xl border p-3">
            <Checkbox
              id="perfil-prestador"
              checked={isPrestador}
              onCheckedChange={(checked) => setIsPrestador(checked === true)}
            />
            <label htmlFor="perfil-prestador" className="text-sm leading-none">
              Sou prestador
            </label>
          </div>
        ) : null}

        {isPrestador && (!onboardingOptional || needsDocuments) ? (
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-3">
              <Checkbox
                id="possui-cnpj"
                checked={hasCnpj}
                onCheckedChange={(checked) => setHasCnpj(checked === true)}
              />
              <label htmlFor="possui-cnpj" className="text-sm leading-none">
                Possuo CNPJ
              </label>
            </div>
            {hasCnpj ? (
              <div>
                <label className="text-sm">CNPJ</label>
                <Input
                  value={cnpj}
                  onChange={(e) => setCnpj(e.target.value)}
                  className="mt-1"
                  placeholder="Somente números"
                />
              </div>
            ) : (
              <div>
                <label className="text-sm">CPF (opcional)</label>
                <Input
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  className="mt-1"
                  placeholder="Somente números"
                />
              </div>
            )}
          </div>
        ) : null}

        <div className="mt-6">
          <h3 className="text-sm font-medium">Endereço</h3>
          <div className="mt-2 grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm">CEP</label>
              <Input
                value={cep}
                onChange={(e) => setCep(e.target.value)}
                className="mt-1"
                placeholder="Somente números"
              />
              {cepLoading ? (
                <p className="mt-1 text-xs text-muted-foreground">Buscando endereço...</p>
              ) : null}
            </div>
            <div>
              <label className="text-sm">Estado (UF)</label>
              <Input
                value={state}
                onChange={(e) => setState(e.target.value.toUpperCase())}
                className="mt-1"
                placeholder="SP"
              />
            </div>
            <div>
              <label className="text-sm">Cidade</label>
              <Input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm">Bairro</label>
              <Input
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm">Rua</label>
              <Input
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm">Número</label>
              <Input
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm">Tipo de endereço</label>
              <select
                className="mt-1 w-full rounded-md border bg-background p-2"
                value={typeLocation}
                onChange={(e) => setTypeLocation(e.target.value)}
              >
                <option value="Residencial">Residencial</option>
                <option value="Comercial">Comercial</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          {canSkip ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setNeedsOnboarding(false);
                setOnboardingOptional(false);
              }}
              disabled={isSaving}
            >
              Mais tarde
            </Button>
          ) : null}
          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? "Salvando..." : "Salvar e continuar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
