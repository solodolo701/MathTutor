import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import "../globals.css";
import { LOCALES, LOCALE_META, isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

/** Pre-render every locale rather than building them on first request. */
export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

/** Title and description follow the locale, so search results match the page. */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(isLocale(lang) ? lang : "hu");

  return {
    title: dict.meta.title,
    description: dict.meta.description,
    manifest: "/manifest.json",
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: dict.meta.appName,
    },
    // Tell crawlers the other languages exist, so each is indexed in its own
    // right instead of competing as duplicates.
    alternates: {
      languages: Object.fromEntries(
        LOCALES.map((l) => [LOCALE_META[l].htmlLang, `/${l}`])
      ),
    },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F5F4FB" },
    { media: "(prefers-color-scheme: dark)", color: "#100F1E" },
  ],
  width: "device-width",
  initialScale: 1,
};

const themeScript = `(function(){var t=localStorage.getItem('theme');if(!t)t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.setAttribute('data-theme',t);})();`;

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const { lang } = await params;
  // An unsupported locale in the URL is a 404, not a silent fallback —
  // otherwise /fr/dashboard would quietly serve Hungarian.
  if (!isLocale(lang)) notFound();

  return (
    <html
      lang={LOCALE_META[lang].htmlLang}
      suppressHydrationWarning
      className={`${jakarta.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
