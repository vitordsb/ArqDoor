import type { FormEvent } from "react";
import { Lock, Mail, ShieldCheck } from "lucide-react";

type AdminLoginViewProps = {
  email: string;
  password: string;
  authSubmitting: boolean;
  authError: string | null;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
};

export function AdminLoginView({
  email,
  password,
  authSubmitting,
  authError,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}: AdminLoginViewProps) {
  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto flex min-h-screen max-w-3xl items-center px-6 py-10">
        <div className="w-full rounded-3xl border border-slate-200 bg-white p-6">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
              <ShieldCheck className="h-3.5 w-3.5" />
              ArqDoor Admin
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
              Painel interno da operação
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Acesso restrito para acompanhamento de contratos, pagamentos, documentos e conversas.
            </p>
          </div>

          <form className="space-y-4" onSubmit={onSubmit}>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Email administrativo</span>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 transition focus-within:border-sky-300 focus-within:ring-4 focus-within:ring-sky-50">
                <Mail className="h-4 w-4 text-slate-400" />
                <input
                  className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  placeholder="admin@arqdoor.com"
                  value={email}
                  onChange={(event) => onEmailChange(event.target.value)}
                />
              </div>
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Senha</span>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 transition focus-within:border-sky-300 focus-within:ring-4 focus-within:ring-sky-50">
                <Lock className="h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  placeholder="********"
                  value={password}
                  onChange={(event) => onPasswordChange(event.target.value)}
                />
              </div>
            </label>

            <button
              type="submit"
              disabled={authSubmitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              {authSubmitting ? "Entrando..." : "Entrar no painel"}
            </button>
          </form>

          {authError ? (
            <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {authError}
            </div>
          ) : null}

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
            CPF, senha de login e senha de contrato ficam fora desse painel por padrão.
          </div>
        </div>
      </div>
    </div>
  );
}
