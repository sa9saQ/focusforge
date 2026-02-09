"use client";

import { usePathname } from "next/navigation";

type RouteFadeProps = {
  children: React.ReactNode;
};

export const RouteFade = ({ children }: RouteFadeProps): React.ReactElement => {
  const pathname = usePathname();

  return (
    <div key={pathname} className="route-fade-in">
      {children}
    </div>
  );
};
