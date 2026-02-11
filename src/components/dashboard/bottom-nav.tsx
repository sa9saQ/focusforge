"use client";

import { BarChart3, ListTodo, Settings, Timer } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  {
    key: "tasks",
    icon: ListTodo,
    dashboardHref: "/dashboard#tasks",
  },
  {
    key: "timer",
    icon: Timer,
    dashboardHref: "/dashboard#timer",
  },
  {
    key: "progress",
    icon: BarChart3,
    dashboardHref: "/dashboard#progress",
  },
  {
    key: "settings",
    icon: Settings,
    dashboardHref: "/dashboard/settings",
  },
] as const;

export const BottomNav = (): React.ReactElement => {
  const t = useTranslations("BottomNav");
  const pathname = usePathname();
  const isSettingsRoute = pathname.startsWith("/dashboard/settings");

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border/70 bg-background/95 px-2 py-2 backdrop-blur-xl md:hidden">
      <ul className="mx-auto grid max-w-xl grid-cols-4 gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.key === "settings" ? isSettingsRoute : !isSettingsRoute && item.key === "tasks";
          const label = t(item.key);

          return (
            <li key={item.key}>
              <Link
                href={item.dashboardHref}
                className={cn(
                  "flex h-11 flex-col items-center justify-center rounded-lg text-[11px] font-medium transition-colors",
                  isActive ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                )}
                aria-label={t("open", { section: label })}
              >
                <Icon className="mb-0.5 size-4" />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
