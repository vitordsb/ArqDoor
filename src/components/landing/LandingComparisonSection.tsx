import { Check, X } from "lucide-react";
import { landingType } from "@/components/landing/typography";

const highlights = [
  "Visualização simples e compreensível das etapas da obra",
  "Segurança de receber o valor cobrado na data certa",
  "Assinatura, Pagamento e Visualização das etapas em um único ato",
  "Mecanismos de geração de provas que protegem juridicamente o seu trabalho",
  "Gestão e organização 100% digital dos documentos das suas obras",
];

export default function LandingComparisonSection() {
  return (
    <section className="w-full bg-[#d9d9e6] py-20">
      <div className="mx-auto max-w-[1280px] px-6">
        <h2 className={`mx-auto max-w-[980px] text-center ${landingType.comparisonTitle}`}>
          Já é hora de atualizar o seu modo
          <br />
          de trabalho
        </h2>

        <div className="mt-14">
          <div className="flex items-start gap-8">
            {/* Coluna esquerda fixa */}
            <div className="w-[170px] shrink-0">
              <div className="mb-6 grid grid-cols-2 items-end gap-x-6">
                <div className="flex justify-center">
                  <span className={`text-center ${landingType.comparisonLabel}`}>
                    Modelo
                    <br />
                    tradicional
                  </span>
                </div>

                <div className="flex justify-center">
                  <span className="text-center text-base font-extrabold leading-none text-[#ef6a14] sm:text-lg md:text-xl">
                    ARQ
                  </span>
                </div>
              </div>

              <div className="space-y-6">
                {highlights.map((item, index) => (
                  <div
                    key={`icons-${index}`}
                    className="grid h-[62px] grid-cols-2 items-center gap-x-6"
                  >
                    <div className="flex justify-center">
                      <div className="flex h-[58px] w-[58px] items-center justify-center rounded-full bg-[#ff1414]">
                        <X
                          className="h-[30px] w-[30px] text-white"
                          strokeWidth={3.5}
                        />
                      </div>
                    </div>

                    <div className="flex justify-center">
                      <div className="flex h-[58px] w-[58px] items-center justify-center rounded-full bg-[#79be08]">
                        <Check
                          className="h-[30px] w-[30px] text-white"
                          strokeWidth={3.5}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Coluna direita com cards */}
            <div className="min-w-0 flex-1">
              <div className="h-[34px]" />

              <div className="space-y-6">
                {highlights.map((item) => (
                  <div
                    key={item}
                    className="flex h-[62px] items-center rounded-[20px] border border-[#d8d3cf] bg-[#f4f1f1] px-6 shadow-[12px_12px_22px_rgba(0,0,0,0.16)] md:px-8"
                  >
                    <p className={landingType.comparisonRow}>
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
