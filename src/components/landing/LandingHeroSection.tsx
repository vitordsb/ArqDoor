import { Check, ShieldCheck } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import type { LandingPrimaryCta } from "@/components/landing/types";
import { landingType } from "@/components/landing/typography";

interface LandingHeroSectionProps {
  primaryCta: LandingPrimaryCta;
}

export default function LandingHeroSection({ primaryCta }: LandingHeroSectionProps) {
  return (
    <section className="relative overflow-hidden bg-[#efe4de] pb-12 pt-8 md:pb-16 md:pt-12 lg:pb-20">
      <div className="mx-auto grid w-full max-w-[1360px] gap-8 px-4 lg:grid-cols-[1.02fr_1fr] lg:items-center lg:gap-7">
        <div className="text-center lg:text-left">
          <h1 className={landingType.heroTitle}>
            Estruture o projeto, formalize o contrato e receba com{" "}
            <span className="inline-block bg-[#F05B10] px-3 py-0.5 font-medium text-white">mais segurança</span>
          </h1>

          <p className={`mx-auto mt-7 max-w-[700px] lg:mx-0 lg:max-w-[840px] ${landingType.heroBody}`}>
            Com a ArqDoor, arquitetos e engenheiros organizam seus projetos por etapas, definem valores por fase, formalizam o
            contrato e contam com intermediação segura de pagamentos em uma única plataforma.
          </p>

          <div className="mt-9 flex flex-col items-center gap-5 lg:items-start">
            <Button
              asChild
              className={`h-[56px] rounded-[20px] bg-[#F05B10] px-8 text-white hover:bg-[#db530f] md:h-[62px] md:px-11 ${landingType.buttonText}`}
            >
              <Link href={primaryCta.href}>{primaryCta.label}</Link>
            </Button>

            <a
              href="#escrow"
              className="inline-flex items-center gap-3 text-base font-semibold leading-snug text-[#cf4f10] sm:text-lg md:text-xl"
            >
              <ShieldCheck className="h-7 w-7 flex-shrink-0 md:h-8 md:w-8" />
              Utilize Escrow e proteja 100% dos seus honorários
            </a>
          </div>
        </div>

        <div className="relative mx-auto mt-2 w-full max-w-[1000px] lg:mt-0">
          <img src="/images/landing/Imagem_pag1.png" alt="Fluxo de etapas do projeto na ArqDoor" className="w-full rounded-[24px]" />

          <span className="absolute -bottom-3 right-6 hidden h-[78px] w-[78px] items-center justify-center rounded-full bg-[#ececf0] text-[#F05B10] shadow-[0_10px_18px_rgba(0,0,0,0.2)] md:inline-flex">
            <Check className="h-10 w-10" />
          </span>
        </div>
      </div>
    </section>
  );
}
