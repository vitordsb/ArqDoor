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
    <header className="relative z-40 bg-[#efe4de] pt-5">
      <div className="mx-auto w-full max-w-[1360px] px-4">
        <div className="flex h-[74px] items-center justify-between rounded-[999px] border border-[#cec5bf] bg-[#f5efeb] px-3 md:px-6">
          <Link href="/" className="inline-flex items-center">
            <img src="/images/landing/logo.png" alt="ArqDoor" className="h-9 w-auto md:h-10" />
          </Link>

          <nav className="hidden items-center gap-9 xl:flex">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={landingType.navLink}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <Button
            asChild
            className={`h-12 rounded-[18px] bg-[#F05B10] px-5 text-white hover:bg-[#db530f] md:h-[54px] md:rounded-[20px] md:px-8 ${landingType.navButton}`}
          >
            <Link href={primaryCta.href}>{primaryCta.label}</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
