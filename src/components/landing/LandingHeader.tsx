import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import type { LandingPrimaryCta } from "@/components/landing/types";
import { landingType } from "@/components/landing/typography";

interface LandingHeaderProps {
  primaryCta: LandingPrimaryCta;
}

const navItems = [
  { label: "Sobre nós", href: "#sobre" },
  { label: "Fale com a equipe de vendas", href: "#contato-vendas" },
];

export default function LandingHeader({ primaryCta }: LandingHeaderProps) {
  return (
    <header className="relative z-40 border-b border-[#e6e6e6] bg-[#FFF]">
      <div className="mx-auto w-full max-w-[1600px] px-6 md:px-12">
        <div className="flex h-[80px] items-center max-w-[1280px] mx-auto">
          <Link href="/" className="inline-flex items-center">
            <img src="/images/landing/logo.png" alt="ArqDoor" className="h-5 w-auto md:h-9" />
          </Link>

          <nav className="mx-auto hidden items-center gap-10 lg:flex">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={`${landingType.navLink} text-[#4A5565] hover:text-[#e85a0c]`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <Button
            asChild
            className={`h-[40px] rounded-xl bg-[#e85a0c] px-7 text-white shadow-[0_3px_8px_rgba(0,0,0,0.18)] hover:bg-[#cf4f0a] md:px-8 ${landingType.navButton}`}
          >
            <Link href={primaryCta.href}>{primaryCta.label}</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
