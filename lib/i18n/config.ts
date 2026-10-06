/**
 * Locale configuration.
 *
 * Hungarian is the default: the product is built around the Hungarian
 * NAT 2020 curriculum, so `hu` is the source of truth for both UI copy and
 * maths content, and the other locales are translations of it.
 */

export const LOCALES = ["hu", "en", "de"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "hu";

export interface LocaleMeta {
  /** Value for the <html lang> attribute. */
  htmlLang: string;
  /** Name of the language written in that language, for the switcher. */
  nativeName: string;
  /** Short label for compact UI. */
  short: string;
  /**
   * Decimal separator used when a student types a number.
   * Hungarian and German write 3,14; English writes 3.14. Answer checking
   * has to accept whichever the student's locale actually uses, or correct
   * answers get marked wrong.
   */
  decimalSeparator: "," | ".";
  /** Intl locale tag for number/date formatting. */
  intlTag: string;
}

export const LOCALE_META: Record<Locale, LocaleMeta> = {
  hu: {
    htmlLang: "hu",
    nativeName: "Magyar",
    short: "HU",
    decimalSeparator: ",",
    intlTag: "hu-HU",
  },
  en: {
    htmlLang: "en",
    nativeName: "English",
    short: "EN",
    decimalSeparator: ".",
    intlTag: "en-GB",
  },
  de: {
    htmlLang: "de",
    nativeName: "Deutsch",
    short: "DE",
    decimalSeparator: ",",
    intlTag: "de-DE",
  },
};

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/**
 * Picks the best supported locale from an Accept-Language header.
 * Deliberately dependency-free: the header is a simple weighted list and
 * pulling in a negotiation library for three locales is not worth it.
 */
export function matchLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return DEFAULT_LOCALE;

  const ranked = acceptLanguage
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.find((p) => p.trim().startsWith("q="));
      const quality = q ? parseFloat(q.split("=")[1]) : 1;
      return { tag: tag.trim().toLowerCase(), quality: isNaN(quality) ? 0 : quality };
    })
    .sort((a, b) => b.quality - a.quality);

  for (const { tag } of ranked) {
    // Match the base language, so en-US and en-GB both resolve to en.
    const base = tag.split("-")[0];
    if (isLocale(base)) return base;
  }

  return DEFAULT_LOCALE;
}

/**
 * Rewrites a path to a different locale, preserving the rest of the route
 * so a language switch keeps you on the page you were reading.
 */
export function pathWithLocale(pathname: string, locale: Locale): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length > 0 && isLocale(segments[0])) {
    segments[0] = locale;
  } else {
    segments.unshift(locale);
  }
  return "/" + segments.join("/");
}
