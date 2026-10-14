import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense, type CSSProperties } from "react";

import { GarmentPrint } from "@/components/home/garment-print";
import { Wordmark } from "@/components/home/site-header";
import { getCurrentUser } from "@/lib/dal";
import { buttonDown, darkJeans, floralBlouse, trousers } from "@/lib/wardrobe";

/** Already signed in? Skip the form. Reads the session, so it streams in behind Suspense. */
async function RedirectIfSignedIn() {
  if (await getCurrentUser()) redirect("/wardrobe");
  return null;
}

const board = [
  { garment: buttonDown, tilt: "-4deg", className: "left-[6%] top-[8%]" },
  { garment: trousers, tilt: "3deg", className: "right-[6%] top-[14%]" },
  { garment: floralBlouse, tilt: "2.5deg", className: "left-[10%] bottom-[8%]" },
  { garment: darkJeans, tilt: "-3deg", className: "right-[8%] bottom-[4%]" },
];

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-dvh flex-col lg:grid lg:grid-cols-2">
      <div className="flex flex-col">
        <header className="flex h-16 items-center px-4 pt-[env(safe-area-inset-top)] sm:px-6 lg:px-12">
          <Link href="/" className="rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
            <Wordmark />
          </Link>
        </header>
        <main className="flex flex-1 items-start justify-center px-4 pt-10 pb-24 sm:pt-16 lg:items-center lg:pt-0">
          <div className="w-full max-w-sm">{children}</div>
        </main>
      </div>

      {/* A still pinboard beside the form on wide screens: what's waiting on the other side. */}
      <aside aria-hidden="true" className="relative m-3 hidden overflow-hidden rounded-[calc(var(--radius-surface)*1.5)] bg-secondary lg:block">
        {board.map(({ garment, tilt, className }) => (
          <GarmentPrint
            key={garment.name}
            garment={garment}
            eager
            className={`absolute w-[38%] max-w-64 rotate-(--tilt) ${className}`}
            style={{ "--tilt": tilt } as CSSProperties}
          />
        ))}
      </aside>

      <Suspense fallback={null}>
        <RedirectIfSignedIn />
      </Suspense>
    </div>
  );
}
