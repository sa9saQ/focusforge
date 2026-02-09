import { BottomNav } from "@/components/dashboard/bottom-nav";
import { FeedbackButton } from "@/components/dashboard/feedback-button";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.ReactElement {
  return (
    <>
      {children}
      <FeedbackButton />
      <BottomNav />
    </>
  );
}
