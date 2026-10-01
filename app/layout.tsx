import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Inter, Newsreader } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SiteHeader } from "@/components/site-header";
import { ServiceWorkerRegister } from "@/components/service-worker-register";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
});

export const metadata: Metadata = {
  title: {
    default: "Margins — reading notes",
    template: "%s — Margins",
  },
  description:
    "Personal notes from books worth revisiting — summaries, key ideas, and takeaways, kept in one place.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf8f5" },
    { media: "(prefers-color-scheme: dark)", color: "#161412" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${newsreader.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-border">
            <div className="mx-auto max-w-3xl px-6 py-8 text-sm text-muted flex flex-wrap items-center justify-between gap-3">
              <p>
                <span className="font-serif italic text-base">Margins</span> — notes from books
                worth revisiting
              </p>
              {process.env.NODE_ENV === "development" && (
                <p>
                  Everything here is markdown in <code className="font-mono text-xs">content/</code>{" "}
                  ·{" "}
                  <Link href="/keystatic" className="hover:text-accent underline underline-offset-4">
                    edit in the browser
                  </Link>
                </p>
              )}
            </div>
          </footer>
        </ThemeProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
