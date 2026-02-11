import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.ReactElement {
  return (
    <html suppressHydrationWarning>
      <body className="font-[var(--font-body)]">{children}</body>
    </html>
  );
}
