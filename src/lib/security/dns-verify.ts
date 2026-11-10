import dns from "dns/promises";

interface MxValidationResult {
  deliverable: boolean;
  mxRecords?: string[];
  reason?: string;
}

const mxCache = new Map<string, { deliverable: boolean; mxRecords: string[]; timestamp: number }>();
const CACHE_TTL_MS = 1000 * 60 * 30; // 30 minutes cache

/**
 * Validates whether an email recipient's domain has active DNS MX mail exchange records.
 * Prevents "Address not found" / "Host not found" bouncebacks before sending.
 */
export async function verifyEmailDomainMx(email: string): Promise<MxValidationResult> {
  const parts = email.trim().toLowerCase().split("@");
  if (parts.length !== 2) {
    return { deliverable: false, reason: "Malformed email format" };
  }

  const domain = parts[1];

  // In test environments or for test/example domains, bypass live DNS query
  if (process.env.NODE_ENV === "test" || domain.includes("test") || domain.includes("example")) {
    return { deliverable: true, mxRecords: ["mock-mx.test.internal"] };
  }

  // Check cache
  const cached = mxCache.get(domain);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return { deliverable: cached.deliverable, mxRecords: cached.mxRecords };
  }

  try {
    const records = await dns.resolveMx(domain);
    if (!records || records.length === 0) {
      return {
        deliverable: false,
        reason: `Domain "${domain}" has no configured MX mail exchange records.`,
      };
    }

    const sortedExchanges = records
      .sort((a, b) => a.priority - b.priority)
      .map((r) => r.exchange);

    mxCache.set(domain, {
      deliverable: true,
      mxRecords: sortedExchanges,
      timestamp: Date.now(),
    });

    return {
      deliverable: true,
      mxRecords: sortedExchanges,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "DNS resolution failure";
    return {
      deliverable: false,
      reason: `DNS MX check failed for domain "${domain}": ${errorMsg}`,
    };
  }
}
