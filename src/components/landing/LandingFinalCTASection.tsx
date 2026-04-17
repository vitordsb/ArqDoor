import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import type { LandingPrimaryCta } from "@/components/landing/types";
import { landingType } from "@/components/landing/typography";

interface LandingFinalCTASectionProps {
  primaryCta: LandingPrimaryCta;
}

export default function LandingFinalCTASection({ primaryCta }: LandingFinalCTASectionProps) {
  return (
    <section className="bg-[#F05B10] pb-0 pt-14 text-white md:pt-20">
      <div className="mx-auto w-full max-w-[1360px] px-4">
        <div className="mx-auto max-w-[880px] text-center">
          <p className="mx-auto max-w-[650px] text-sm font-normal leading-relaxed text-[#ffe8da] sm:text-base md:text-xl">
            A excelência na arquitetura não está apenas na entrega final, mas também na forma em que o projeto é conduzido!
          </p>

          <h2 className={`mt-6 text-white ${landingType.sectionTitle}`}>
            Profissionalize a sua gestão de contratos hoje mesmo
          </h2>

          <div className="mt-8 md:mt-12">
            <Button
              asChild
              className={`h-[54px] rounded-full bg-[#f1f1f1] px-8 text-[#cf5315] hover:bg-white md:h-[62px] md:px-14 transition-all duration-300 hover:scale-105 ${landingType.buttonText}`}
            >
              <Link href={primaryCta.href}>Crie o seu primeiro contrato digital gratuitamente</Link>
            </Button>
          </div>
        </div>

        <div className="mt-14 border-t border-white/45 md:mt-16" />
      </div>
    </section>
  );
}
