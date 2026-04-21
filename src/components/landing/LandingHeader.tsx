import { useEffect, useState } from "react";
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
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 24);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "border-b border-[#e6e6e6] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
          : "bg-white shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
      }`}
    >
      <div className="mx-auto w-full max-w-[1600px] px-6 md:px-12">
        <div
          className={`mx-auto flex max-w-[1280px] items-center transition-all duration-300 ${
            isScrolled ? "h-[70px]" : "h-[80px]"
          }`}
        >
          <Link href="/" className="inline-flex items-center">
            <img
              src="/images/landing/logo.png"
              alt="ArqDoor"
              className={`w-auto transition-all duration-300 ${
                isScrolled ? "h-5 md:h-8" : "h-5 md:h-9"
              }`}
            />
          </Link>

          <nav className="mx-auto hidden items-center gap-10 lg:flex">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={`${landingType.navLink} text-[#4A5565] transition-colors duration-300 hover:text-[#e85a0c]`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <Button
            asChild
            className={`rounded-xl bg-[#e85a0c] text-white shadow-[0_3px_8px_rgba(0,0,0,0.18)] transition-all duration-300 hover:bg-[#cf4f0a] ${
              isScrolled
                ? `h-[38px] px-6 md:px-7 ${landingType.navButton}`
                : `h-[40px] px-7 md:px-8 ${landingType.navButton}`
            }`}
          >
            <Link href={primaryCta.href}>{primaryCta.label}</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}