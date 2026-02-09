import { BottomNav } from "@/components/dashboard/bottom-nav";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.ReactElement {
  return (
    <>
      {children}
      <BottomNav />
    </>
  );
}
