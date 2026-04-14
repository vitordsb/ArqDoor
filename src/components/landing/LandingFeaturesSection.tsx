import { ListChecks, Vault } from "lucide-react";
import { landingType } from "@/components/landing/typography";

const features = [
  {
    title: "Contratos Digitais Inteligentes",
    description:
      "Acelera a negociação através do envio de contratos por link. Assinatura eletrônica, pagamento e visualização das fases em um único ato.",
    icon: <img src="/images/landing/icon-card-1.png" alt="Ícone de contratos digitais inteligentes" className="h-[122px] w-[122px] object-contain" />,
    tone: "bg-[#f4f4f4] text-[#404040]",
  },
  {
    title: "Previsibilidade de Pagamento",
    description:
      "Utilize a ArqDoor Escrow para intermediar os pagamentos. Anule a barreira de desconfiança com a nossa ferramenta e receba os seus honorários em dia.",
    icon: <Vault className="h-[112px] w-[112px] text-white" strokeWidth={1.7} />,
    tone: "bg-[#F05B10] text-white",
  },
  {
    title: "Acompanhamento de Obras",
    description:
      "Organize cada projeto com o nosso sistema, e torne cada contrato em uma experiência simples de acompanhar para o seu cliente.",
    icon: <ListChecks className="h-[110px] w-[110px] text-white" strokeWidth={1.7} />,
    tone: "bg-[#4a423d] text-white",
  },
];

export default function LandingFeaturesSection() {
  return (
    <section className="bg-[#d9d9e6] py-16 md:py-20">
      <div className="mx-auto w-full max-w-[1360px] px-4">
        <h2 className={`text-center ${landingType.sectionTitle}`}>
          O que oferecemos
        </h2>

        <div className="mx-auto mt-10 grid w-full max-w-[1110px] gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.title}
              className={`flex h-full min-h-[520px] flex-col rounded-[20px] px-9 pb-8 pt-8 shadow-[0_8px_18px_rgba(0,0,0,0.14)] ${feature.tone}`}
            >
              <h3 className={`text-center ${landingType.cardTitle}`}>
                {feature.title}
              </h3>
              <div className="mt-8 flex justify-center">{feature.icon}</div>
              <p className={`mt-8 text-left font-medium opacity-95 ${landingType.cardBody}`}>
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
