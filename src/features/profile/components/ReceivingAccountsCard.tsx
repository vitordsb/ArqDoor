import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCnpj, formatCpf } from "@/lib/utils";
import { Edit2, Landmark, Loader2, Plus, Trash2, Wallet } from "lucide-react";
import type { ProviderReceivingAccountApi } from "../types";

type ReceivingAccountDraft = {
  nickname: string;
  bank_name: string;
  bank_agency: string;
  bank_account: string;
  bank_document: string;
  pix_key: string;
};

type Props = {
  accounts: ProviderReceivingAccountApi[];
  loading: boolean;
  onCreate: (draft: ReceivingAccountDraft) => Promise<boolean>;
  onUpdate: (accountId: number, draft: ReceivingAccountDraft) => Promise<boolean>;
  onDelete: (accountId: number) => Promise<boolean>;
};

const emptyDraft = (): ReceivingAccountDraft => ({
  nickname: "",
  bank_name: "",
  bank_agency: "",
  bank_account: "",
  bank_document: "",
  pix_key: "",
});

const formatDocument = (value: string) => {
  const digits = (value || "").replace(/\D/g, "");
  if (digits.length <= 11) return formatCpf(digits);
  return formatCnpj(digits.slice(0, 14));
};

const maskAccount = (value: string) => {
  const text = (value || "").trim();
  if (text.length <= 4) return text;
  return `${text.slice(0, 2)}***${text.slice(-2)}`;
};

export function ReceivingAccountsCard({
  accounts,
  loading,
  onCreate,
  onUpdate,
  onDelete,
}: Props) {
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [draft, setDraft] = React.useState<ReceivingAccountDraft>(emptyDraft());
  const [saving, setSaving] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<number | null>(null);

  const openCreate = () => {
    setEditingId(0);
    setDraft(emptyDraft());
  };

  const openEdit = (account: ProviderReceivingAccountApi) => {
    setEditingId(account.id);
    setDraft({
      nickname: account.nickname,
      bank_name: account.bank_name,
      bank_agency: account.bank_agency,
      bank_account: account.bank_account,
      bank_document: account.bank_document,
      pix_key: account.pix_key,
    });
  };

  const closeEditor = () => {
    setEditingId(null);
    setDraft(emptyDraft());
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const ok =
        editingId && editingId > 0
          ? await onUpdate(editingId, draft)
          : await onCreate(draft);
      if (ok) closeEditor();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (accountId: number) => {
    setDeletingId(accountId);
    try {
      await onDelete(accountId);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Carteira de recebimento
            </CardTitle>
            <p className="mt-2 text-sm text-slate-500">
              Cadastre as contas que poderão ser escolhidas quando o contrato usar recebimento padrão.
            </p>
          </div>
          <Button onClick={openCreate} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Nova conta
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-6 text-slate-500">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Carregando carteira...
            </div>
          ) : accounts.length === 0 ? (
            <div className="rounded-xl border border-dashed p-4 text-sm text-slate-500">
              Nenhuma conta cadastrada ainda. Adicione pelo menos uma para usar o método padrão nos contratos e links.
            </div>
          ) : (
            <div className="space-y-3">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-700">
                          {account.nickname}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-slate-900">
                        {account.bank_name}
                      </p>
                      <p className="text-sm text-slate-500">
                        Agência {account.bank_agency} · Conta {maskAccount(account.bank_account)}
                      </p>
                      <p className="text-sm text-slate-500">
                        Documento {formatDocument(account.bank_document)} · PIX {account.pix_key}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" onClick={() => openEdit(account)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(account.id)}
                        disabled={deletingId === account.id}
                      >
                        {deletingId === account.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={editingId !== null} onOpenChange={(open) => !open && closeEditor()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader className="pr-8">
            <DialogTitle className="flex items-center gap-2 text-slate-900">
              <Landmark className="h-4 w-4 text-orange-600" />
              {editingId && editingId > 0 ? "Editar conta" : "Nova conta"}
            </DialogTitle>
            <DialogDescription>
              {editingId && editingId > 0
                ? "Os dados atuais já estão carregados para você ajustar somente o que precisar."
                : "Cadastre uma nova conta para reutilizar esse recebimento nos contratos e links."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Apelido</Label>
              <Input
                value={draft.nickname}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, nickname: e.target.value }))
                }
                placeholder="Ex.: Conta PJ principal"
              />
            </div>
            <div className="space-y-2">
              <Label>Banco</Label>
              <Input
                value={draft.bank_name}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, bank_name: e.target.value }))
                }
                placeholder="Ex.: Itaú, Nubank, Caixa"
              />
            </div>
            <div className="space-y-2">
              <Label>Agência</Label>
              <Input
                value={draft.bank_agency}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, bank_agency: e.target.value }))
                }
                placeholder="0001"
              />
            </div>
            <div className="space-y-2">
              <Label>Conta</Label>
              <Input
                value={draft.bank_account}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, bank_account: e.target.value }))
                }
                placeholder="12345-6"
              />
            </div>
            <div className="space-y-2">
              <Label>CPF ou CNPJ</Label>
              <Input
                value={formatDocument(draft.bank_document)}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    bank_document: e.target.value.replace(/\D/g, "").slice(0, 14),
                  }))
                }
                placeholder="Somente números"
              />
            </div>
            <div className="space-y-2">
              <Label>Chave PIX</Label>
              <Input
                value={draft.pix_key}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, pix_key: e.target.value }))
                }
                placeholder="email, telefone, documento ou chave aleatória"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={closeEditor}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : editingId && editingId > 0 ? (
                "Salvar alterações"
              ) : (
                "Cadastrar conta"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
