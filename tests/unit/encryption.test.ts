import { describe, it, expect } from "vitest";
import { encryptSecret, decryptSecret } from "@/lib/security/encryption";

describe("Token Encryption and Decryption (AES-256-GCM)", () => {
  it("encrypts and successfully decrypts OAuth refresh tokens and secrets", () => {
    const originalToken = JSON.stringify({
      access_token: "ya29.sample_google_access_token_xyz",
      refresh_token: "1//04_sample_refresh_token_abc",
      expiry_date: Date.now() + 3600000,
    });

    const encrypted = encryptSecret(originalToken);
    expect(encrypted).not.toContain("ya29.");
    expect(encrypted.split(":")).toHaveLength(3); // iv:authTag:cipher

    const decrypted = decryptSecret(encrypted);
    expect(decrypted).toBe(originalToken);
    expect(JSON.parse(decrypted).access_token).toBe("ya29.sample_google_access_token_xyz");
  });

  it("throws an error when attempting to decrypt corrupted or tampered payloads", () => {
    expect(() => decryptSecret("corrupted-payload-without-colons")).toThrow();
  });
});
