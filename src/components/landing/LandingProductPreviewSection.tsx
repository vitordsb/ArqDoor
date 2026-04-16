import { LockKeyhole, ShieldCheck } from "lucide-react";
import { HiOutlineLightBulb } from "react-icons/hi";
import { landingType } from "@/components/landing/typography";
import { useTypewriter } from "@/hooks/use-typewriter";

const featureCards = [
  {
    title: "Clareza",
    description: "Etapas e entregas definidas",
    icon: <HiOutlineLightBulb className="h-20 w-20 text-white stroke-[2.2]" />,
  },
  {
    title: "Proteção",
    description: "Assinatura eletrônica",
    icon: <ShieldCheck className="h-10 w-10 text-white stroke-[2.2]" />,
  },
  {
    title: "Segurança",
    description: "Pagamento intermediado",
    icon: <LockKeyhole className="h-10 w-10 text-white stroke-[2.2]" />,
  },
];

export default function LandingProductPreviewSection() {
  const typedText = useTypewriter(
  "Organize o seu trabalho com Contratos Digitais Inteligentes_",
  35
);
  return (
    <section id="sobre" className="bg-[#DADAE6] py-20 ">
      <div className="mx-auto flex w-full max-w-[1380px] flex-col gap-10 px-4 lg:flex-row lg:items-start lg:gap-6 xl:gap-10">

        <div className="w-full lg:w-[50%] ">
          <img
            src="/images/landing/Tela_img.png"
            alt="Prévia de contrato digital ArqDoor"
            className="block w-full object-contain"
          />
        </div>

        <div className="flex w-full lg:w-[42%] xl:w-[40%] flex-col justify-center">
          <div className="max-w-[560px]">
            <h2 className={`relative whitespace-pre-line ${landingType.sectionTitle}`}>
              {/* Texto invisível  */}
              <span className="invisible">
                Organize o seu trabalho<br /> 
                com Contratos Digitais <br />
                Inteligentes_
              </span>
              
              <span className="absolute left-0 top-0 w-full font-normal leading-tight text-justify break-words">
                {typedText}
                <span className="animate-pulse">|</span>
              </span>
            </h2>

            <p className={`mt-14 text-justify ${landingType.sectionBody}`}>
              Na relação entre arquiteto e cliente, a falta de estrutura pode
              gerar dúvidas sobre escopo, pagamentos e responsabilidades.
            </p>

            <p className={`mt-4 text-justify ${landingType.sectionBody}`}>
              Por isso, garanta uma experiência Premium para o seu cliente
              utilizando os nossos Contratos Digitais Inteligentes, e evite
              atritos desnecessários.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3 max-w-[650px] mx-auto">
            {featureCards.map((card) => (
              <article
                key={card.title}
                className="flex w-full max-w-[320px] mx-auto flex-col items-center rounded-[18px] bg-[#F05A0F] px-2 py-5 text-center text-white shadow-[0_15px_35px_rgba(0,0,0,0.3),0_10px_15px_rgba(0,0,0,0.2)]"
              >
                <h3 className={landingType.cardTitle}>
                  {card.title}
                </h3>

                <div className="mt-4 flex h-12 w-12 items-center justify-center">
                  {card.icon}
                </div>

                <p className={"mt-4 font-medium text-white"}>
                  {card.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
