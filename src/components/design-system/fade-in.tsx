"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

interface FadeInProps {
  children: ReactNode;
  /** Stagger delay in ms — use multiples of 60-80 for sibling lists. */
  delay?: number;
  className?: string;
}

/**
 * Lightweight entrance animation with no external motion library.
 * Uses an IntersectionObserver so off-screen cards don't animate until
 * scrolled into view, and respects prefers-reduced-motion via CSS
 * (see .animate-af-fade-up in globals.css).
 */
export function FadeIn({ children, delay = 0, className }: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [animationFinished, setAnimationFinished] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      onAnimationEnd={() => setAnimationFinished(true)}
      style={visible ? { animationDelay: `${delay}ms` } : { opacity: 0 }}
      className={cn(visible && !animationFinished && "animate-af-fade-up", className)}
    >
      {children}
    </div>
  );
}
