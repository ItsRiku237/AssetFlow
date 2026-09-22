import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";

import { GlassCard } from "@/components/design-system/glass-card";
import { SectionHeader } from "@/components/shared/section-header";

interface DashboardSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  /** Optional link to the full list page for this section (real existing route only). */
  viewAllHref?: string;
}

export function DashboardSection({
  title,
  description,
  children,
  viewAllHref,
}: DashboardSectionProps) {
  return (
    <GlassCard className="space-y-3 p-4">
      <div className="flex items-start justify-between gap-3">
        <SectionHeader title={title} description={description} />
        {viewAllHref ? (
          <Link
            href={viewAllHref}
            className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            View all
            <ArrowRight className="size-3" />
          </Link>
        ) : null}
      </div>
      {children}
    </GlassCard>
  );
}
