import { LockKeyhole, ShieldCheck } from "lucide-react";
import { HiOutlineLightBulb } from "react-icons/hi";
import { landingType } from "@/components/landing/typography";
import { useTypewriter } from "@/hooks/use-typewriter";

const featureCards = [
  {
    title: "Clareza",
    description: "Etapas e entregas definidas",
    icon: <HiOutlineLightBulb className="h-20 w-20 text-[#fffffe] transition-colors duration-300 group-hover:text-[#e85a0c]" />,
  },
  {
    title: "Proteção",
    description: "Assinatura eletrônica",
    icon: <ShieldCheck className="h-10 w-10 text-[#fffffe] transition-colors duration-300 group-hover:text-[#e85a0c]" />,
  },
  {
    title: "Segurança",
    description: "Pagamento intermediado",
    icon: <LockKeyhole className="h-10 w-10 text-[#fffffe] transition-colors duration-300 group-hover:text-[#e85a0c]" />,
  },
];

export default function LandingProductPreviewSection() {
  const typedPrefix = "Organize o seu trabalho com ";
  const typedHighlight = "Contratos Digitais Inteligentes";
  const typedText = useTypewriter(
    `${typedPrefix}${typedHighlight}`,
    35
  );

  const typedPrefixIsComplete = typedText.length >= typedPrefix.length;
  const typedHighlightPortion = typedPrefixIsComplete ? typedText.slice(typedPrefix.length) : "";
  return (
    <section id="sobre" className="bg-[#DADAE6] py-24 ">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col lg:flex-row lg:items-center gap-6 lg:gap-10 xl:gap-16">

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
              
              <span className="absolute left-0 top-0 w-full font-semibold leading-tight text-justify break-words">
                {typedPrefixIsComplete ? (
                  <>
                    {typedPrefix}
                    <span className="text-[#e85a0c]">{typedHighlightPortion}</span>
                  </>
                ) : (
                  typedText
                )}
                <span className="animate-pulse text-[#e85a0c]">_</span>
              </span>
            </h2>

            <p className={`mt-14 text-justify text-[#636466] ${landingType.sectionBody}`}>
              Na relação entre arquiteto e cliente, a falta de estrutura pode
              gerar dúvidas sobre escopo, pagamentos e responsabilidades.
            </p>

            <p className={`mt-4 text-justify text-[#636466] ${landingType.sectionBody}`}>
              Por isso, garanta uma experiência Premium para o seu cliente
              utilizando os nossos Contratos Digitais Inteligentes, e evite
              atritos desnecessários.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3 max-w-[650px] mx-auto">
            {featureCards.map((card) => (
              <article
                key={card.title}
                className="group mx-auto flex w-full max-w-[320px] flex-col items-center rounded-[18px] bg-[#F05A0F] px-2 py-5 text-center text-[#1F2937] shadow-[0_10px_28px_rgba(240,90,15,0.16)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#fffffe] hover:text-[#F05A0F] hover:shadow-[0_16px_34px_rgba(240,90,15,0.35)]"
              >
                <h3 className={`${landingType.miniCardTitle} text-[#fffffe] transition-colors duration-300 group-hover:text-[#e85a0c]`}>
                  {card.title}
                </h3>

                <div className="mt-4 flex h-12 w-12 items-center justify-center">
                  {card.icon}
                </div>

                <p className="mt-4 font-normal text-[#fffffe] transition-colors duration-300 group-hover:text-[#e85a0c]">
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
