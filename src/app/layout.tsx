import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "FocusForge",
  description: "ADHD-friendly task management with AI breakdown, Pomodoro, and gamification",
  manifest: "/manifest.json",
  themeColor: "#4a7c59",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FocusForge",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-512.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.ReactElement {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-[var(--font-body)]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
