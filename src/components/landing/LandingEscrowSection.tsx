import { landingType } from "@/components/landing/typography";

const escrowSteps = [
  "Preencha as informações do contrato, dividindo-as em quantas fases preferir.",
  "Envie o link gerado para o seu cliente, e aguarde a assinatura e o pagamento dele.",
  "O pagamento efetuado por seu cliente fica em um Fundo de Custódia, protegido até a finalização da fase correspondente.",
  "Declare a finalização da fase e aguarde o cliente confirmar. Então, receba os valores em sua conta",
];

export default function LandingEscrowSection() {
  return (
    <section id="escrow" className="bg-[#e75812] py-16 text-white">
      <div className="mx-auto grid w-full max-w-[1380px] gap-16 px-4 lg:grid-cols-[1fr_1.05fr] lg:items-center">
        <div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight">
            <span className="block leading-[1.1]">
              Cliente atrasando pagamento?
            </span>
            <span className="block leading-[1.1] mt-3">
              Utilize a ArqDoor Escrow!
            </span>
          </h2>
          <p className={`mt-6 text-orange-50 ${landingType.sectionBody}`}>
            Você nunca mais precisará cobrar o pagamento dos seus clientes. Com a ArqDoor Escrow, o pagamento é efetuado pelo seu
            cliente antes de iniciar a obra, protegido num fundo de custódia separado.
          </p>

          <ol className="mt-6 space-y-5">
            {escrowSteps.map((step, index) => (
              <li key={step} className="grid grid-cols-[48px_1fr] items-center gap-3">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white font-bold text-[#F36F21]">
                  {index + 1}
                </span>
                <span className={`text-orange-50 ${landingType.cardBody}`}>{step}</span>
              </li>
            ))}
          </ol>
          
          <p className="inline-flex gap-3 mt-6 rounded-xl bg-white/15 px-4 py-3 text-base font-semibold leading-snug sm:text-lg">
            <svg
              viewBox="0 0 36 36"
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 flex-shrink-0 md:h-8 md:w-8"
              fill="currentColor"
            >
            <path d="M31.25,7.4a43.79,43.79,0,0,1-6.62-2.35,45,45,0,0,1-6.08-3.21L18,1.5l-.54.35a45,45,0,0,1-6.08,3.21A43.79,43.79,0,0,1,4.75,7.4L4,7.59v8.34c0,13.39,13.53,18.4,13.66,18.45l.34.12.34-.12c.14,0,13.66-5.05,13.66-18.45V7.59Zm-4.57,6.65L15.51,24.9,9.19,18.57a1.4,1.4,0,0,1,2-2L15.54,21,24.73,12a1.4,1.4,0,1,1,2,2Z" />
          </svg>
            100% dos seus honorários protegidos por Escrow
          </p>
        </div>

        <div className="mw-[600px]">
          <img src="/images/landing/esquema_escrow.png" alt="Fluxo de proteção de pagamento via Escrow" className="w-full rounded-2xl" />
        </div>
      </div>
    </section>
  );
}
