
// src/components/AuthModals.tsx
import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Loader2, Mail, Lock, UserRound, CalendarDays, Eye, EyeOff, BadgeCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { RegisterInterface, LoginInterface } from "@/lib/Interfaces";

// --- Small helpers -----------------------------------------------------------
function DialogShell({
  title,
  description,
  children,
}: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border bg-background shadow-xl">
      {/* gradient header */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-44" />

      <div className="relative p-7 sm:p-8">
        <DialogHeader className="mb-4">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-600/10 ring-1 ring-amber-600/30">
              <BadgeCheck className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold tracking-tight">
                {title}
              </DialogTitle>
              {description ? (
                <DialogDescription className="text-muted-foreground">
                  {description}
                </DialogDescription>
              ) : null}
            </div>
          </div>
        </DialogHeader>
        {children}
      </div>
    </div>
  );
}

function FieldIcon({ icon: Icon }: { icon: React.ElementType }) {
  return (
    <span className="pointer-events-none absolute inset-y-0 left-3 inline-flex items-center text-muted-foreground">
      <Icon className="h-4 w-4" />
    </span>
  );
}

function PasswordInput({
  value,
  onChange,
  placeholder,
  id,
}: {
  value?: string;
  onChange: (v: string) => void;
  placeholder?: string;
  id?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <FieldIcon icon={Lock} />
      <Input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-10"
      />
      <button
        type="button"
        aria-label={show ? "Ocultar senha" : "Mostrar senha"}
        onClick={() => setShow((s) => !s)}
        className="absolute inset-y-0 right-2 inline-flex items-center rounded-md px-2 text-muted-foreground hover:text-foreground"
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

function SectionDivider({ label }: { label?: string }) {
  return (
    <div className="relative my-2 flex items-center">
      <div className="h-px w-full bg-border" />
      {label ? (
        <span className="mx-2 shrink-0 text-xs uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
      ) : null}
      <div className="h-px w-full bg-border" />
    </div>
  );
}

// --- Component ---------------------------------------------------------------
export const AuthModals: React.FC<{
  isLoginOpen: boolean;
  isRegisterOpen: boolean;
  onLoginClose: () => void;
  onRegisterClose: () => void;
  onSuccess?: () => void;
  onSwitchToRegister: () => void;
  onSwitchToLogin: () => void;
}> = ({
  isLoginOpen,
  isRegisterOpen,
  onLoginClose,
  onRegisterClose,
  onSuccess,
  onSwitchToRegister,
  onSwitchToLogin,
}) => {
    const { toast } = useToast();
    const { login, register } = useAuth();
    const [loginLoading, setLoginLoading] = useState(false);
    const [registerLoading, setRegisterLoading] = useState(false);

    // forms
    const loginForm = useForm<LoginInterface>({
      defaultValues: { email: "", password: "" },
    });
    const registerForm = useForm<RegisterInterface>({
      defaultValues: {
        name: "",
        email: "",
        gender: "",
        birth: "",
        type: "contratante",
        password: "",
        confirmPassword: "",
        termos_aceitos: false,
      },
    });

    const [isPrestador, setIsPrestador] = useState(false);
    const fieldClasses = "w-full";

    const handlePrestadorChange = (checked: boolean) => {
      registerForm.setValue("type", checked ? "prestador" : "contratante");
      setIsPrestador(checked);
    };

    async function handleLogin(data: LoginInterface) {
      setLoginLoading(true);
      try {
        await login(data);
        toast({ title: "Bem-vindo!", description: "Login realizado com sucesso." });
        onSuccess?.();
      } catch (err) {
        toast({
          title: "Erro no login",
          description: (err as Error).message,
          variant: "destructive",
        });
      } finally {
        setLoginLoading(false);
      }
    }

    async function handleRegister(data: RegisterInterface) {
      // validações rápidas
      if (!data.name?.trim())
        return toast({ title: "Nome inválido", description: "Preencha o nome.", variant: "destructive" });
      if (!data.email?.trim())
        return toast({ title: "Email inválido", description: "Preencha um email válido.", variant: "destructive" });
      if (!data.gender)
        return toast({ title: "Gênero não preenchido", description: "Selecione o gênero.", variant: "destructive" });
      if (!data.birth)
        return toast({ title: "Nascimento não preenchido", description: "Informe a data de nascimento.", variant: "destructive" });
      if (!data.password)
        return toast({ title: "Senha obrigatória", description: "Informe sua senha.", variant: "destructive" });
      if (data.password !== data.confirmPassword)
        return toast({ title: "Senhas não coincidem", description: "As senhas devem ser iguais.", variant: "destructive" });
      if (!data.termos_aceitos)
        return toast({ title: "Termos não aceitos", description: "Aceite os termos para continuar.", variant: "destructive" });

      try {
        setRegisterLoading(true);
        const registerData: RegisterInterface = {
          name: data.name.trim(),
          email: data.email.trim(),
          password: data.password,
          confirmPassword: data.confirmPassword,
          gender: data.gender,
          birth: data.birth,
          type: isPrestador ? "prestador" : "contratante",
          termos_aceitos: data.termos_aceitos,
        };
        await register(registerData);
        onSuccess?.();
        if (onSuccess) {
          onSwitchToLogin();
          toast({
            title: "Horá do login!!",
            description: "Agora efetue o login no cadastro realizado!",
            variant: "default"
          });
        }
      } catch (err) {
        toast({ title: "Erro no cadastro", description: (err as Error).message, variant: "destructive" });
      } finally {
        setRegisterLoading(false);
      }
    }

    // subtle password meter (client-side only, visual)
    const passwordScore = useMemo(() => {
      const p = registerForm.getValues("password");
      let s = 0;
      if (p?.length >= 6) s++;
      if (/[A-Z]/.test(p || "")) s++;
      if (/[0-9]/.test(p || "")) s++;
      if (/[^A-Za-z0-9]/.test(p || "")) s++;
      return s; // 0..4
    }, [registerForm.watch("password")]);

    return (
      <>
        {/* LOGIN */}
        <Dialog open={isLoginOpen} onOpenChange={onLoginClose}>
          <DialogContent className="max-w-md border-0 bg-transparent p-0">
            <DialogShell title="Login" description="Entre com seu e‑mail e senha.">
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E‑mail</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <FieldIcon icon={Mail} />
                            <Input type="email" {...field} className="pl-9" placeholder="voce@exemplo.com" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Senha</FormLabel>
                        <FormControl>
                          <PasswordInput value={field.value} onChange={field.onChange} placeholder="••••••••" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="text-left text-sm text-muted-foreground hover:underline">
                    <a href="#">Esqueci minha senha</a>
                  </div>
                  <Button type="submit" disabled={loginLoading} className="w-full">
                    {loginLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Entrar
                  </Button>
                  <div className="text-center text-sm text-muted-foreground">
                    <span className="cursor-pointer hover:underline" onClick={onSwitchToRegister}>
                      Criar uma conta
                    </span>
                  </div>
                </form>
              </Form>
            </DialogShell>
          </DialogContent>
        </Dialog>

        {/* REGISTER */}
        <Dialog open={isRegisterOpen} onOpenChange={onRegisterClose}>
          <DialogContent className="max-w-lg border-0 bg-transparent p-0">
            <DialogShell title="Criar conta" description="Preencha os dados para começar.">
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={registerForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome completo</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <FieldIcon icon={UserRound} />
                              <Input {...field} className="pl-9" placeholder="Seu nome" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>E‑mail</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <FieldIcon icon={Mail} />
                              <Input type="email" {...field} className="pl-9" placeholder="voce@exemplo.com" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={registerForm.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gênero</FormLabel>
                          <FormControl>
                            <select {...field} className="w-full rounded-md border bg-background p-2">
                              <option value="" disabled>
                                Selecione...
                              </option>
                              <option value="Masculino">Masculino</option>
                              <option value="Feminino">Feminino</option>
                              <option value="notSay">Prefiro não informar</option>
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="birth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data de nascimento</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <FieldIcon icon={CalendarDays} />
                              <Input type="date" {...field} className="pl-9" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex items-center gap-3 rounded-xl border p-3">
                    <Checkbox
                      id="sou-prestador"
                      checked={isPrestador}
                      onCheckedChange={handlePrestadorChange}
                    />
                    <label htmlFor="sou-prestador" className="text-sm leading-none">
                      Sou prestador
                    </label>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Senha</FormLabel>
                          <FormControl>
                            <PasswordInput value={field.value} onChange={field.onChange} placeholder="Mínimo 8 caracteres" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirmar senha</FormLabel>
                          <FormControl>
                            <PasswordInput value={field.value} onChange={field.onChange} placeholder="Repita a senha" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* visual password meter */}
                  <AnimatePresence>
                    {registerForm.watch("password") ? (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="grid grid-cols-4 gap-1"
                      >
                        {[0, 1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className={`h-1 rounded ${i < passwordScore ? "bg-amber-500" : "bg-muted"}`}
                          />
                        ))}
                      </motion.div>
                    ) : null}
                  </AnimatePresence>

                  <FormField
                    control={registerForm.control}
                    name="termos_aceitos"
                    defaultValue={false}
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-3">
                        <FormControl>
                          <Checkbox
                            id="termos_aceitos"
                            checked={!!field.value}
                            onCheckedChange={(checked) => field.onChange(checked === true)}
                          />
                        </FormControl>
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">
                            Declaro que li e aceito os {" "}
                            <a href="/termos-de-uso" target="_blank" className="text-amber-600 underline">
                              Termos de uso
                            </a>
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={registerLoading} className="w-full bg-amber-600 hover:bg-amber-600/90">
                    {registerLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Cadastrar
                  </Button>
                  <div className="text-center">
                    <a
                      onClick={onSwitchToLogin}
                      className="text-sm text-muted-foreground hover:underline cursor-pointer"
                    >
                      Já tem cadastro? Faça login!
                    </a>
                  </div>
                </form>
              </Form>
            </DialogShell>
          </DialogContent>
        </Dialog>
      </>
    );
  };

export default AuthModals;

