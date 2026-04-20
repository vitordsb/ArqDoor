import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import type { LandingPrimaryCta } from "@/components/landing/types";
import { landingType } from "@/components/landing/typography";

interface LandingHeroSectionProps {
  primaryCta: LandingPrimaryCta;
}

export default function LandingHeroSection({ primaryCta }: LandingHeroSectionProps) {
  return (
    <section className="relative overflow-hidden bg-[#fffaf3] pt-12 md:pt-[74px]">
      <div className="mx-auto grid w-full max-w-[1280px] gap-10 px-4 lg:grid-cols-2 lg:items-start lg:gap-x-16">
        <div className="max-w-[580px] text-center lg:text-left ">
          <h1 className={landingType.heroTitle}>
            Estruture o projeto, <br />
            formalize o contrato <br />
            e receba com
            <span className={landingType.heroSpan}>
              mais segurança
            </span>
          </h1>

          <p className={`mx-auto mt-6 max-w-[700px] lg:mx-0 lg:max-w-[550px] ${landingType.heroBody}`}>
            Com a ArqDoor, arquitetos e engenheiros organizam seus projetos por etapas, definem valores por fase, formalizam o
            contrato e contam com intermediação segura de pagamentos em uma única plataforma.
          </p>

          <div className="mt-6 flex flex-col items-center gap-5 lg:items-start">
            <Button
              asChild
              className={`inline-flex items-center justify-center rounded-[16px] bg-[#e45712] px-4 py-6 font-medium text-white transition-colors hover:bg-[#ce4f0f] md:px-11 ${landingType.buttonText}`}
            >
              <Link href={primaryCta.href}>{primaryCta.label}</Link>
            </Button>

            <a
              href="#escrow"
              className="mt-2 inline-flex items-center gap-2 text-base font-semibold leading-snug text-[#e75812] border border-[#e75812] bg-[#FFF7ED] rounded-[16px] px-4 py-3"
            >
              <svg
                viewBox="0 0 36 36"
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 flex-shrink-0 md:h-6 md:w-6"
                fill="currentColor"
              >
                <path d="M31.25,7.4a43.79,43.79,0,0,1-6.62-2.35,45,45,0,0,1-6.08-3.21L18,1.5l-.54.35a45,45,0,0,1-6.08,3.21A43.79,43.79,0,0,1,4.75,7.4L4,7.59v8.34c0,13.39,13.53,18.4,13.66,18.45l.34.12.34-.12c.14,0,13.66-5.05,13.66-18.45V7.59Zm-4.57,6.65L15.51,24.9,9.19,18.57a1.4,1.4,0,0,1,2-2L15.54,21,24.73,12a1.4,1.4,0,1,1,2,2Z" />
              </svg>

              Utilize Escrow e proteja 100% dos seus honorários
            </a>
          </div>
        </div>

        <div className="relative mt-2 w-full lg:mt-0 lg:justify-self-end">
          <img
            src="/images/landing/Imagem_pag1.png"
            alt="Fluxo de etapas do projeto na ArqDoor"
            className="w-full max-w-[620px]"
          />
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/20 to-transparent" />
    </section>
  );
}