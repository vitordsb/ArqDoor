import { landingType } from "@/components/landing/typography";

const escrowSteps = [
  "Preencha as informações do contrato, dividindo-o nas fases desejadas.",
  "Envie o link gerado para o cliente e aguarde assinatura e pagamento.",
  "O pagamento fica protegido em fundo de custódia até a conclusão da fase correspondente.",
  "Após declarar a finalização da fase e o cliente confirmar, o valor é liberado para sua conta.",
];

export default function LandingEscrowSection() {
  return (
    <section id="escrow" className="bg-[#F36F21] py-16 text-white md:py-20">
      <div className="mx-auto grid w-full max-w-[1240px] gap-10 px-4 lg:grid-cols-[1fr_1.05fr] lg:items-center">
        <div>
          <h2 className={`text-white ${landingType.sectionTitle}`}>Cliente atrasando pagamento? Utilize a ArqDoor Escrow!</h2>
          <p className={`mt-5 text-orange-50 ${landingType.sectionBody}`}>
            Você nunca mais precisará cobrar o pagamento dos seus clientes. Com a ArqDoor Escrow, o pagamento é efetuado pelo seu
            cliente antes de iniciar a obra, protegido num fundo de custódia separado.
          </p>
          <p className="mt-5 rounded-xl bg-white/15 px-4 py-3 text-base font-semibold leading-snug sm:text-lg">
            100% dos seus honorários protegidos por Escrow
          </p>
          <ol className="mt-6 space-y-3">
            {escrowSteps.map((step, index) => (
              <li key={step} className="grid grid-cols-[28px_1fr] gap-3">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white font-bold text-[#F36F21]">
                  {index + 1}
                </span>
                <span className={`text-orange-50 ${landingType.cardBody}`}>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="rounded-3xl bg-black/25 p-4 shadow-xl md:p-6">
          <img src="/images/landing/esquema_escrow.png" alt="Fluxo de proteção de pagamento via Escrow" className="w-full rounded-2xl" />
        </div>
      </div>
    </section>
  );
}
