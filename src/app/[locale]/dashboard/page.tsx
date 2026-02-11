import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

type DashboardPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: DashboardPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    title: t("dashboardTitle"),
  };
}

export default function DashboardPage(): React.ReactElement {
  return <DashboardShell />;
}
