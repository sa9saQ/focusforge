import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "FocusForge",
  description: "ADHD-friendly task and focus companion",
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
