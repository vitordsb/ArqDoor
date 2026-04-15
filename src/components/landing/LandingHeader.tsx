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
    <header className="relative z-40 bg-[#ffece3] pt-5">
      <div className="mx-auto w-full max-w-[1360px] px-10">
        <div className="flex h-[60px] items-center justify-between rounded-[999px] border border-[#cec5bf] bg-[#f9ede7] px-3 md:px-6">
          <Link href="/" className="inline-flex items-center">
            <img src="/images/landing/logo.png" alt="ArqDoor" className="h-4 w-auto md:h-8" />
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
            className={`h-12 rounded-[16px] bg-[#e45712] px-4 text-white hover:bg-[#ce4f0f] md:h-[40px] md:rounded-[14px] md:px-8 ${landingType.navButton}`}
          >
            <Link href={primaryCta.href}>{primaryCta.label}</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
