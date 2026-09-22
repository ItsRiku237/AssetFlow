import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { AssetForm } from "@/components/assets/asset-form";
import { FadeIn } from "@/components/design-system/fade-in";
import { GlassCard } from "@/components/design-system/glass-card";
import { PageHero } from "@/components/design-system/page-hero";
import { Button } from "@/components/ui/button";
import { createAsset } from "@/lib/actions/asset-actions";
import { requireRole } from "@/lib/auth-guards";

export default async function NewAssetPage() {
  await requireRole("ADMIN");

  return (
    <div className="space-y-5">
      <FadeIn>
        <PageHero imageSrc="/images/assets-hero.webp" className="px-6 py-7 sm:px-8">
          <div className="space-y-1.5">
            <Button variant="ghost" size="sm" asChild className="-ml-1 mb-2 text-muted-foreground">
              <Link href="/assets">
                <ArrowLeft className="size-3.5" />
                Back to Assets
              </Link>
            </Button>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Asset Management
            </p>
            <h1 className="text-2xl font-semibold tracking-tight">
              Add <span className="text-gradient-brand">Asset</span>
            </h1>
            <p className="text-sm text-muted-foreground">
              Register a new company asset in the system.
            </p>
          </div>
        </PageHero>
      </FadeIn>

      <FadeIn delay={60}>
        <GlassCard className="p-6">
          <AssetForm action={createAsset} submitLabel="Create asset" />
        </GlassCard>
      </FadeIn>
    </div>
  );
}
