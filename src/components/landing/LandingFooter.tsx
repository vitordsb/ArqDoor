import { Instagram } from "lucide-react";
import { landingType } from "@/components/landing/typography";

export default function LandingFooter() {
  return (
    <footer id="contato-vendas" className="bg-[#F05B10] pb-10 pt-10 text-white md:pb-12 md:pt-12">
      <div className="mx-auto w-full max-w-[1360px] px-4">
        <div className="grid grid-cols-1 gap-10 text-center sm:grid-cols-2 sm:text-left lg:grid-cols-[1.2fr_1fr_1fr_1fr] lg:items-start">
          <div className="flex justify-center sm:justify-start">
            <img src="/images/landing/logo_branca.png" alt="ArqDoor" className="h-[66px] w-auto md:h-[72px]" />
          </div>

          <div>
            <p className={landingType.footerHeading}>Legal</p>
            <ul className="mt-4 space-y-2">
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
            <ul className="mt-4 space-y-2">
              <li>
                <a href="#" className={landingType.footerLink}>
                  Fale Conosco
                </a>
              </li>
            </ul>
          </div>

          <div className="flex flex-col items-center sm:items-start">
            <p className={landingType.footerHeading}>Redes Sociais</p>
            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="mt-4 inline-flex h-[68px] w-[68px] items-center justify-center rounded-2xl bg-white/15 transition hover:bg-white/25"
            >
              <Instagram className="h-11 w-11 text-white" />
            </a>
          </div>
        </div>

        <div className={`mt-12 text-center md:mt-14 ${landingType.legal}`}>
          <p>
            ArqDoor, uma plataforma Zameed Inova Simples (I.S.) | CNPJ: 57.795.075/0001-23
          </p>
          <p>ArqDoor® - Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
