"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

type TurnstileApi = {
  render: (element: HTMLElement, options: Record<string, unknown>) => string;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

type TurnstileProps = {
  /** Changes after each submit; tokens are single-use, so the widget re-issues one. */
  resetKey?: unknown;
};

/**
 * Cloudflare Turnstile bot check. Usually completes on its own; posts its token as the
 * `cf-turnstile-response` form field. Renders nothing when no site key is configured.
 */
export function Turnstile({ resetKey }: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<string | null>(null);
  const [loaded, setLoaded] = useState(() => typeof window !== "undefined" && Boolean(window.turnstile));

  // Render once the script is ready (explicit mode, so it works on client-side navigations too).
  useEffect(() => {
    if (!SITE_KEY || !loaded || !containerRef.current || !window.turnstile) return;
    const theme = document.documentElement.getAttribute("data-theme");
    widgetRef.current = window.turnstile.render(containerRef.current, {
      sitekey: SITE_KEY,
      action: "signup",
      theme: theme === "light" || theme === "dark" ? theme : "auto",
      "response-field-name": "cf-turnstile-response",
    });
    return () => {
      if (widgetRef.current) window.turnstile?.remove(widgetRef.current);
      widgetRef.current = null;
    };
  }, [loaded]);

  // A submitted token is spent; get a fresh one for the next attempt.
  useEffect(() => {
    if (resetKey !== undefined && widgetRef.current) window.turnstile?.reset(widgetRef.current);
  }, [resetKey]);

  if (!SITE_KEY) return null;
  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={() => setLoaded(true)}
      />
      <div ref={containerRef} className="min-h-[65px]" />
    </>
  );
}
