import { URL } from "url";

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
  "169.254.169.254", // AWS/GCP metadata service
  "metadata.google.internal",
  "instance-data",
]);

export function validateSafeUrl(urlString: string): { safe: boolean; error?: string; url?: URL } {
  try {
    const url = new URL(urlString);
    
    // Only allow http and https
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return { safe: false, error: `Invalid protocol: ${url.protocol}. Only http and https are allowed.` };
    }

    const hostname = url.hostname.toLowerCase();

    // Check blocked exact hostnames
    if (BLOCKED_HOSTNAMES.has(hostname)) {
      return { safe: false, error: "Access to private or metadata endpoint is forbidden." };
    }

    // Check private IPv4 ranges
    // 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 127.0.0.0/8, 169.254.0.0/16
    const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    const ipMatch = hostname.match(ipv4Regex);
    if (ipMatch) {
      const p1 = parseInt(ipMatch[1], 10);
      const p2 = parseInt(ipMatch[2], 10);

      if (p1 === 10) return { safe: false, error: "Access to 10.0.0.0/8 is forbidden." };
      if (p1 === 127) return { safe: false, error: "Access to loopback 127.0.0.0/8 is forbidden." };
      if (p1 === 172 && p2 >= 16 && p2 <= 31) return { safe: false, error: "Access to 172.16.0.0/12 is forbidden." };
      if (p1 === 192 && p2 === 168) return { safe: false, error: "Access to 192.168.0.0/16 is forbidden." };
      if (p1 === 169 && p2 === 254) return { safe: false, error: "Access to link-local 169.254.0.0/16 is forbidden." };
      if (p1 === 0) return { safe: false, error: "Access to 0.0.0.0 is forbidden." };
    }

    // Check internal TLDs
    if (hostname.endsWith(".local") || hostname.endsWith(".internal") || hostname.endsWith(".onion")) {
      return { safe: false, error: "Access to internal domain is forbidden." };
    }

    return { safe: true, url };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Invalid URL structure";
    return { safe: false, error: message };
  }
}
