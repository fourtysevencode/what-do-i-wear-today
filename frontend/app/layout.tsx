import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://wardrobe.ronakbuilds.tech"),
  title: "What do I wear today?",
  description:
    "Photograph the clothes you own. Get outfits for the weather and your plans, built only from your own wardrobe.",
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fff8fb" },
    { media: "(prefers-color-scheme: dark)", color: "#140a16" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      // Smooth scrolling is set in globals.css; this tells Next to pause it during route changes.
      data-scroll-behavior="smooth"
      className={`${outfit.variable} ${geist.variable} ${geistMono.variable} antialiased`}
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
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
