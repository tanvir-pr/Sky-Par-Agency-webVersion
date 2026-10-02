"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { LiveChatWidget } from "@/components/widgets/live-chat-widget";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Admin and client portal render their own full-screen app shell (no public chrome).
  const isAppShell =
    pathname.startsWith("/admin") || pathname.startsWith("/portal");

  if (isAppShell) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
      <LiveChatWidget />
    </>
  );
}
