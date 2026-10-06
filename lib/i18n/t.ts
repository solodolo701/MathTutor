/**
 * Interpolates `{name}` placeholders in a dictionary string.
 *
 * Dictionary values are plain strings rather than functions so the whole
 * dictionary can be passed from a Server Component into a Client Component
 * as props — React cannot serialise functions across that boundary.
 *
 * An unknown placeholder is left as-is rather than replaced with
 * "undefined", so a missing variable shows up as `{count}` in the UI and is
 * obvious during review instead of silently reading as broken copy.
 */
export function t(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in vars ? String(vars[key]) : match
  );
}
