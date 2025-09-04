import { ReactNode } from "react";
import Navbar from "@/components/Navbar";

interface MessagesLayoutProps {
  children: ReactNode;
}

export default function MessagesLayout({ children }: MessagesLayoutProps) {
  return (
    <div className="flex flex-col">
      <Navbar />
      <main className="flex-grow pt-8">
        {children}
      </main>
    </div>
  );
}
