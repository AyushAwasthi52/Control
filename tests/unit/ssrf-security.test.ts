import { describe, it, expect } from "vitest";
import { validateSafeUrl } from "@/lib/security/ssrf";

describe("SSRF Protection Engine", () => {
  it("blocks localhost and loopback IPv4 addresses", () => {
    expect(validateSafeUrl("http://localhost/admin").safe).toBe(false);
    expect(validateSafeUrl("http://127.0.0.1:8080/metrics").safe).toBe(false);
    expect(validateSafeUrl("http://127.0.1.1").safe).toBe(false);
  });

  it("blocks cloud metadata service IP endpoints", () => {
    expect(validateSafeUrl("http://169.254.169.254/latest/meta-data").safe).toBe(false);
  });

  it("blocks private network IPv4 ranges (10.x, 192.168.x, 172.16.x)", () => {
    expect(validateSafeUrl("http://10.0.0.1/status").safe).toBe(false);
    expect(validateSafeUrl("http://192.168.1.1/router").safe).toBe(false);
    expect(validateSafeUrl("http://172.16.0.5").safe).toBe(false);
  });

  it("permits valid public HTTP and HTTPS websites", () => {
    expect(validateSafeUrl("https://www.8bitdo.com").safe).toBe(true);
    expect(validateSafeUrl("https://flydigi.com/products").safe).toBe(true);
    expect(validateSafeUrl("http://pulsar.gg").safe).toBe(true);
  });

  it("rejects non-HTTP protocols like file://, ftp://, or gopher://", () => {
    expect(validateSafeUrl("file:///etc/passwd").safe).toBe(false);
    expect(validateSafeUrl("ftp://ftp.example.com").safe).toBe(false);
  });
});
