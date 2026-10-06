import type { Locale } from "./config";
import type { Dictionary } from "./dictionaries/hu";

/**
 * Dictionary loader.
 *
 * Dynamic imports keep each locale in its own chunk, so a Hungarian visitor
 * never downloads the German strings. Intended for Server Components; client
 * components receive the dictionary (or the slice they need) as props.
 */
const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  hu: () => import("./dictionaries/hu").then((m) => m.hu),
  en: () => import("./dictionaries/en").then((m) => m.en),
  de: () => import("./dictionaries/de").then((m) => m.de),
};

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale]();
}

export type { Dictionary };
export * from "./config";
export { t } from "./t";
