import type { Metadata, Viewport } from "next";
import { Fraunces } from "next/font/google";
import "./globals.css";

import { ThemeColorSync } from "@/components/theme-color-sync";
import { Toaster } from "@/components/ui/toaster";
import { THEME_COLOR } from "@/lib/theme-color";

// Display face only; UI text uses the platform's system font (see globals.css).
// Variable, so optical size follows the text size and the SOFT axis rounds the serifs a touch.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz", "SOFT"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://wardrobe.ronakbuilds.tech"),
  title: "What do I wear today?",
  description:
    "Photograph the clothes you own. Get outfits for the weather and your plans, built only from your own wardrobe.",
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  // Edge to edge under the notch and home indicator; chrome pads itself with env(safe-area-inset-*).
  viewportFit: "cover",
  // The software keyboard shrinks the layout on Android too, so bottom-pinned UI stays visible.
  interactiveWidget: "resizes-content",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: THEME_COLOR.light },
    { media: "(prefers-color-scheme: dark)", color: THEME_COLOR.dark },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      // Smooth scrolling is set in globals.css; this tells Next to pause it during route changes.
      data-scroll-behavior="smooth"
      className={`${fraunces.variable} antialiased`}
      // The script below may add data-theme before React hydrates.
      suppressHydrationWarning
    >
      <head>
        {/* Apply a saved light/dark choice before first paint. No choice = follow the OS
            (see components/theme-toggle.tsx). */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`,
          }}
        />
      </head>
      <body className="min-h-dvh">
        <Toaster>{children}</Toaster>
        <ThemeColorSync />
      </body>
    </html>
  );
}
