import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { getResumeRoute } from "@/lib/utils";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Clock3,
  FileStack,
  Handshake,
  LineChart,
  ShieldCheck,
  Sparkles,
  Users,
  WalletCards,
} from "lucide-react";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon";

const keyMetrics = [
  {
    value: "Até 7 dias úteis",
    label: "para receber seus honorários.",
    icon: Clock3,
  },
  {
    value: "0%",
    label: "de inadimplência",
    icon: LineChart,
  },
  {
    value: "Assinatura eletrônica",
    label: "com validade jurídica.",
    icon: FileStack,
  },
];

const valueBullets = [
  "Negociação, proposta e contrato no mesmo fluxo para não perder vendas por desorganização.",
  "Acompanhamento de etapas e liberações para dar segurança ao cliente e previsibilidade ao prestador.",
  "Comunicação centralizada com histórico completo de decisões e arquivos técnicos.",
];

const audiences = [
  {
    title: "Construtoras e Escritórios",
    description:
      "Padronize proposta, contrato e acompanhamento para escalar atendimento sem perder qualidade.",
    image:
      "https://images.unsplash.com/photo-1464082354059-27db6ce50048?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Arquitetos Autônomos",
    description:
      "Transforme conversas em oportunidades com fluxo comercial claro e checkpoints de entrega.",
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Engenharia e Reformas",
    description:
      "Ganhe rastreabilidade em cada fase, pagamentos e aprovações com segurança para as partes.",
    image:
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80",
  },
];

const commercialFlow = [
  {
    title: "Briefing e Escopo",
    description: "Organize necessidades, prazos e orçamento desde o primeiro contato.",
    icon: Users,
  },
  {
    title: "Proposta Profissional",
    description: "Estruture etapas, valores e entregas para facilitar decisão do cliente.",
    icon: Handshake,
  },
  {
    title: "Contrato Digital",
    description: "Formalize com segurança e mantenha o histórico completo do combinado.",
    icon: ShieldCheck,
  },
  {
    title: "Execução e Recebimento",
    description: "Acompanhe avanço por etapas e libere pagamentos com transparência.",
    icon: WalletCards,
  },
];

const successStories = [
  {
    company: "Hub de Arquitetura Residencial",
    title: "Mais previsibilidade comercial em projetos simultâneos",
    description:
      "Com proposta por etapas e confirmação no chat, o time reduziu ruído de comunicação e acelerou o fechamento com novos clientes.",
  },
  {
    company: "Consultoria de Reformas Premium",
    title: "Fluxo completo de proposta até entrega final",
    description:
      "A centralização de contrato, arquivos e pagamentos trouxe mais confiança para o cliente e menor retrabalho para a operação.",
  },
];

const CombinedHomeSections = () => {
  const [text, setText] = useState<string>("Comece a usar agora");
  const whatsappUrl = "https://wa.me/message/WYONYONWQG5XG1";
  const { isLoggedIn } = useAuth();
  const primaryCtaHref = isLoggedIn ? getResumeRoute("/home") : "/auth";

  useEffect(() => {
    if (isLoggedIn) {
      setText("Continuar usando, você está online!");
      return;
    }
    setText("Comece a usar agora");
  }, [isLoggedIn]);

  return (
    <main className="bg-white text-slate-900">
      {/* Hero */}
      <section
        className="relative isolate flex min-h-[78vh] items-center overflow-hidden"
      >
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1920&q=80"
            alt="Projeto arquitetônico moderno"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/75 to-black/90" />
        </div>

        <div className="relative container mx-auto max-w-[1280px] px-4 py-20 text-white">
          <span className="mb-4 inline-flex items-center rounded-full border border-orange-300/40 bg-orange-500/20 px-4 py-2 text-sm font-medium text-orange-200">
            Solução comercial para arquitetura e engenharia
          </span>

          <h1 className="mb-6 max-w-4xl text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
            <span className="text-orange-400">Acelere vendas</span> e gerencie seus projetos com segurança profissional
          </h1>

          <p className="mb-10 max-w-2xl text-base text-slate-100 md:text-lg">
            Do primeiro briefing ao contrato digital: transforme negociações em propostas profissionais e acompanhe cada etapa com transparência.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row">
            <Link href={primaryCtaHref}>
              <Button className="rounded-full bg-orange-500 px-8 py-6 text-base font-semibold text-white hover:bg-orange-600">
                {text}
              </Button>
            </Link>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex"
            >
              <Button className="rounded-full bg-green-500 px-8 py-6 text-base font-semibold text-white shadow-none hover:bg-green-600">
                <WhatsAppIcon className="mr-2 h-5 w-5 text-white" />
                Entrar em contato
              </Button>
            </a>
            <Link href="/home">
              <Button
                variant="outline"
                className="rounded-full border-white/60 bg-white/10 px-8 py-6 text-base font-semibold text-white hover:bg-white/20"
              >
                Ver plataforma
              </Button>
            </Link>
          </div>

          <div className="mt-14 grid gap-4 md:grid-cols-3">
            {keyMetrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <article
                  key={metric.label}
                  className="rounded-2xl border border-white/15 bg-white/10 p-6 backdrop-blur-sm"
                >
                  <Icon className="mb-4 h-6 w-6 text-orange-300" />
                  <p className="text-3xl font-bold text-white">{metric.value}</p>
                  <p className="mt-1 text-sm text-slate-200">{metric.label}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Value */}
      <section className="bg-white py-20">
        <div className="container mx-auto grid max-w-[1280px] gap-12 px-4 lg:grid-cols-[1.05fr_1fr] lg:items-center">
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1400&q=80"
              alt="Reunião de projeto em arquitetura"
              className="w-full rounded-3xl object-cover shadow-xl"
            />
            <img
              src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80"
              alt="Detalhes de projeto de interiores"
              className="absolute -bottom-10 -right-6 hidden h-48 w-64 rounded-2xl border-4 border-white object-cover shadow-2xl md:block"
            />
            <div className="absolute -left-4 top-6 flex items-center gap-2 rounded-xl bg-white px-4 py-3 shadow-lg">
              <Sparkles className="h-5 w-5 text-orange-500" />
              <span className="text-sm font-semibold text-slate-800">Fluxo comercial inteligente</span>
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold leading-tight text-slate-900 md:text-4xl">
              Mais que vitrine: uma landing comercial focada em conversão
            </h2>
            <p className="mt-5 text-base text-slate-600">
              O ArqDoor posiciona seu serviço com clareza para o cliente certo, destacando valor, processo e segurança.
            </p>

            <div className="mt-8 space-y-4">
              {valueBullets.map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-xl border border-orange-100 bg-orange-50/40 p-4"
                >
                  <BadgeCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-orange-500" />
                  <p className="text-sm leading-relaxed text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Audience */}
      <section className="bg-slate-50 py-20">
        <div className="container mx-auto max-w-[1280px] px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">
              Uma plataforma comercial para diferentes perfis da construção
            </h2>
            <p className="mt-4 text-slate-600">
              Da prospecção ao fechamento, personalize a operação sem perder velocidade.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {audiences.map((audience) => (
              <article
                key={audience.title}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <img
                  src={audience.image}
                  alt={audience.title}
                  className="h-52 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-slate-900">{audience.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{audience.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Commercial flow */}
      <section className="bg-white py-20">
        <div className="container mx-auto max-w-[1280px] px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">
              Como o ArqDoor organiza sua operação comercial
            </h2>
            <p className="mt-4 text-slate-600">
              Menos fricção no processo e mais foco no que realmente converte.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {commercialFlow.map((step, index) => {
              const Icon = step.icon;
              return (
                <article
                  key={step.title}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-orange-200 hover:shadow-lg"
                >
                  <div className="mb-5 flex items-center justify-between">
                    <div className="rounded-xl bg-orange-100 p-3 text-orange-600">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-bold text-orange-500">0{index + 1}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Proof section */}
      <section className="bg-[#eef2f5] py-20">
        <div className="container mx-auto grid max-w-[1280px] gap-10 px-4 lg:grid-cols-[1fr_1.05fr] lg:items-center">
          <div className="relative min-h-[420px]">
            <img
              src="https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1200&q=80"
              alt="Projeto residencial"
              className="absolute left-0 top-0 h-72 w-[82%] rounded-2xl object-cover shadow-xl"
            />
            <img
              src="https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80"
              alt="Ambiente interno contemporâneo"
              className="absolute bottom-0 right-0 h-60 w-[70%] rounded-2xl border-4 border-white object-cover shadow-2xl"
            />
            <div className="absolute left-6 top-[58%] rounded-xl border border-slate-200 bg-white/95 p-4 shadow-lg">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <Building2 className="h-4 w-4 text-orange-500" />
                Crescimento comercial com processo
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">
              Prova social para reforçar confiança na decisão
            </h2>
            <p className="mt-4 text-slate-600">
              Estruture sua comunicação com mensagens claras de resultado, segurança e previsibilidade.
            </p>

            <div className="mt-8 space-y-5">
              {successStories.map((story) => (
                <article
                  key={story.title}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <p className="text-sm font-semibold text-orange-500">{story.company}</p>
                  <h3 className="mt-1 text-2xl font-bold leading-snug text-slate-900">{story.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{story.description}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-slate-900 py-20 text-white">
        <div className="container mx-auto max-w-[1100px] px-4 text-center">
          <h2 className="text-3xl font-bold md:text-5xl">
            Transforme sua landing em uma máquina comercial de projetos
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base text-slate-300 md:text-lg">
            Organize proposta, contrato e execução em uma experiência clara para o cliente e lucrativa para o prestador.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/auth">
              <Button className="rounded-full bg-orange-500 px-9 py-6 text-base font-semibold text-white hover:bg-orange-600">
                Criar conta no ArqDoor
              </Button>
            </Link>
            <Link href="/home">
              <Button
                variant="outline"
                className="rounded-full border-slate-500 bg-transparent px-9 py-6 text-base font-semibold text-white hover:bg-slate-800"
              >
                Ver oportunidades <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default CombinedHomeSections;
