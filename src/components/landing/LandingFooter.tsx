import { FaInstagram } from "react-icons/fa";
import { landingType } from "@/components/landing/typography";

export default function LandingFooter() {
  return (
    <footer
      id="contato-vendas"
      className="bg-[#F05B10] px-4 pt-10 pb-10 text-white md:pt-14 md:pb-12"
    >
      <div className="mx-auto flex items-center w-full max-w-[1360px] flex-col gap-12 lg:flex-row lg:justify-between">
        <div className="flex justify-center lg:justify-start lg:pt-6">
          <img
            src="/images/landing/logo_branca.png"
            alt="ArqDoor"
            className="h-[62px] w-auto md:h-[68px]"
          />
        </div>

        <div className="flex w-full max-w-[760px] flex-col gap-14">
          <div className="grid grid-cols-1 gap-10 text-center sm:grid-cols-3 sm:text-left">
            <div>
              <p className={landingType.footerHeading}>Legal</p>
              <ul className="mt-2 space-y-3 text-center">
                <li>
                  <a href="/termos-de-uso" className={landingType.footerLink}>
                    Termos de Uso
                  </a>
                </li>
                <li>
                  <a href="#" className={landingType.footerLink}>
                    Política de Privacidade
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <p className={landingType.footerHeading}>Contato</p>
              <ul className="mt-2 space-y-3 text-center">
                <li>
                  <a href="#" className={landingType.footerLink}>
                    Fale Conosco
                  </a>
                </li>
              </ul>
            </div>

            <div className="flex flex-col items-center">
              <p className={landingType.footerHeading}>Redes Sociais</p>
              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="mt-2 inline-flex p-1 items-center justify-center rounded-[8px] transition-all duration-300 hover:bg-white/25 hover:scale-105"
              >
                <FaInstagram className="h-8 w-8 text-white" />
              </a>
            </div>
          </div>

          <div className={`text-center sm:text-right ${landingType.legal}`}>
            <p>
              ArqDoor, uma plataforma Zameed Inova Simples (I.S.) | CNPJ:
              57.795.075/0001-23
            </p>
            <p>ArqDoor® - Todos os direitos reservados.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}