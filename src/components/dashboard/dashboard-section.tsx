import type { ReactNode } from "react";

import { SectionHeader } from "@/components/shared/section-header";

interface DashboardSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function DashboardSection({
  title,
  description,
  children,
}: DashboardSectionProps) {
  return (
    <section className="space-y-3 rounded-lg border border-border bg-card p-4">
      <SectionHeader title={title} description={description} />
      {children}
    </section>
  );
}
