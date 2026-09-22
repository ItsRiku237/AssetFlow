"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";

import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function ThemeSettings() {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);

  return (
    <div className="grid grid-cols-3 gap-2">
      {OPTIONS.map((opt) => {
        const Icon = opt.icon;
        const isActive = mounted && theme === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => setTheme(opt.value)}
            className={cn(
              "flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3 text-xs font-medium",
              "transition-all duration-200 hover:scale-[1.02]",
              isActive
                ? "border-primary/50 bg-primary/10 text-primary shadow-[0_0_12px_-4px_var(--glow-cyan)]"
                : "border-border bg-muted/30 text-muted-foreground hover:border-border/80 hover:bg-muted/60 hover:text-foreground"
            )}
          >
            <Icon className={cn("size-4", isActive && "text-primary")} />
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
