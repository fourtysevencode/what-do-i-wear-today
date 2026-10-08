import type { ReactNode } from "react";

/** Where people can reach the owner about their data or these terms. */
export const CONTACT_EMAIL = "contact@ronakbuilds.tech";
export const CONTACT_URL = `mailto:${CONTACT_EMAIL}`;

export const LEGAL_UPDATED = "9 October 2026";

/** Shared typography for the Privacy Policy and Terms pages. */
export function LegalPage({ title, intro, children }: { title: string; intro: ReactNode; children: ReactNode }) {
  return (
    <article className="text-pretty">
      <h1 className="type-display text-4xl sm:text-5xl">{title}</h1>
      <p className="mt-3 text-sm text-muted-foreground">Last updated {LEGAL_UPDATED}</p>
      <div className="mt-6 text-lg leading-relaxed text-muted-foreground">{intro}</div>
      <div className="mt-10 leading-relaxed [&_a]:rounded-sm [&_a]:font-medium [&_a]:text-foreground [&_a]:underline [&_a]:decoration-foreground/25 [&_a]:underline-offset-4 hover:[&_a]:decoration-pop [&_h2]:mt-12 [&_h2]:mb-4 [&_h2]:font-heading [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_li]:mt-2 [&_p]:mt-4 [&_strong]:font-medium [&_strong]:text-foreground [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:marker:text-muted-foreground">
        {children}
      </div>
    </article>
  );
}
