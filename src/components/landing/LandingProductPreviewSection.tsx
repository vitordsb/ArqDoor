import { LockKeyhole, ShieldCheck } from "lucide-react";
import { landingType } from "@/components/landing/typography";
import { useTypewriter } from "@/hooks/use-typewriter";

const featureCards = [
  {
    title: "Clareza",
    description: "Etapas e entregas definidas",
    icon: (
      <img
        src="/images/landing/icone1.png"
        alt="Ícone Clareza"
        className="h-10 w-10 object-contain brightness-0 invert"
      />
    ),
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
  "Organize o seu\ntrabalho com\nContratos Digitais\nInteligentes_",
  35
);
  return (
    <section id="sobre" className="bg-[#DADAE6] py-16 lg:py-24">
      <div className="mx-auto flex w-full max-w-[1380px] flex-col gap-10 px-4 lg:flex-row lg:items-center lg:gap-6 xl:gap-10">
        {/* ESQUERDA */}
        <div className="w-full lg:w-[58%] xl:w-[60%]">
          <img
            src="/images/landing/Tela_img.png"
            alt="Prévia de contrato digital ArqDoor"
            className="block w-full object-contain"
          />
        </div>

        {/* DIREITA */}
        <div className="flex w-full lg:w-[42%] xl:w-[40%] flex-col justify-center">
          <div className="max-w-[560px]">
            <h2 className={`text-center lg:text-left whitespace-pre-line ${landingType.sectionTitle}`}>
              {typedText}
              <span className="animate-pulse">|</span>
            </h2>

            <p className={`mt-6 text-center lg:text-left ${landingType.sectionBody}`}>
              Na relação entre arquiteto e cliente, a falta de estrutura pode
              gerar dúvidas sobre escopo, pagamentos e responsabilidades.
            </p>

            <p className={`mt-6 text-center lg:text-left ${landingType.sectionBody}`}>
              Por isso, garanta uma experiência Premium para o seu cliente
              utilizando os nossos Contratos Digitais Inteligentes, e evite
              atritos desnecessários.
            </p>
          </div>

          {/* CARDS INFERIORES */}
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3 lg:mt-12">
            {featureCards.map((card) => (
              <article
                key={card.title}
                className="flex min-h-[190px] flex-col items-center rounded-[18px] bg-[#F05A0F] px-4 pt-4 pb-5 text-center text-white shadow-[0_10px_22px_rgba(0,0,0,0.22)]"
              >
                <h3 className={landingType.cardTitle}>
                  {card.title}
                </h3>

                <div className="mt-4 flex h-12 w-12 items-center justify-center">
                  {card.icon}
                </div>

                <p className={`mt-4 font-medium text-white ${landingType.cardBody}`}>
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
