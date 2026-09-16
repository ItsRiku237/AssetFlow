import type { ReactNode } from "react";
import { Boxes } from "lucide-react";

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-8 bg-background p-4">
      <div className="flex items-center gap-2 text-foreground">
        <Boxes className="size-6 text-primary" />
        <span className="text-lg font-semibold tracking-tight">AssetFlow</span>
      </div>
      {children}
    </div>
  );
}
