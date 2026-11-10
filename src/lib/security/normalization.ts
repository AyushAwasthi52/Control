/**
 * Normalization utilities for domains, emails, and company names.
 */

export function normalizeDomain(input: string): string {
  if (!input) return "";
  let clean = input.trim().toLowerCase();
  
  // Remove protocols
  clean = clean.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "");
  
  // Remove paths, queries, ports, and trailing slashes
  clean = clean.split("/")[0].split("?")[0].split(":")[0];
  
  return clean.trim();
}

export function normalizeEmail(email: string): string {
  if (!email) return "";
  const trimmed = email.trim().toLowerCase();
  const parts = trimmed.split("@");
  if (parts.length !== 2) return trimmed;
  
  const [local, domain] = parts;
  // Handle gmail dot aliasing if desired, but keep standard lowercase normalization
  return `${local}@${domain}`;
}

export function normalizeName(name: string): string {
  if (!name) return "";
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .trim();
}

export function isPotentialDuplicate(
  existing: { normalizedName: string; normalizedDomain?: string | null },
  incoming: { name: string; domain?: string }
): boolean {
  const incNormName = normalizeName(incoming.name);
  if (existing.normalizedName && incNormName && existing.normalizedName === incNormName) {
    return true;
  }
  
  if (incoming.domain && existing.normalizedDomain) {
    const incNormDomain = normalizeDomain(incoming.domain);
    if (incNormDomain && existing.normalizedDomain === incNormDomain) {
      return true;
    }
  }
  
  return false;
}
