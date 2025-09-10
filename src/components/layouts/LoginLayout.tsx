import { ReactNode } from "react";
import Navbar from "@/components/Navbar";

interface LoginLayoutProps {
  children: ReactNode;
}

export default function LoginLayout({ children }: LoginLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      {children}
    </div>
  );
}
