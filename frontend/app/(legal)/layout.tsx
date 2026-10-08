import Link from "next/link";

import { SiteFooter } from "@/components/home/closing";
import { Wordmark } from "@/components/home/site-header";

export default function LegalLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="mx-auto flex h-16 w-full max-w-7xl items-center px-4 sm:px-6 lg:px-8">
        <Link href="/" className="rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
          <Wordmark />
        </Link>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pt-10 pb-24 sm:px-6 sm:pt-16">{children}</main>
      <SiteFooter />
    </div>
  );
}
