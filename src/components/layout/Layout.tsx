import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background cyber-grid">
      <Sidebar />
      <Header />
      <main className="ml-64 pt-16 min-h-screen">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
