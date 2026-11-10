import fs from "fs";
import path from "path";

/**
 * Returns environment variables, falling back to reading .env directly from disk.
 * This guarantees that changes made to .env (such as adding Gmail App Password)
 * are immediately recognized without requiring a server reboot.
 */
export function getFreshEnv(): Record<string, string> {
  const result: Record<string, string> = { ...process.env } as Record<string, string>;

  try {
    const envPath = path.join(process.cwd(), ".env");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf-8");
      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eqIdx = trimmed.indexOf("=");
        if (eqIdx !== -1) {
          const key = trimmed.slice(0, eqIdx).trim();
          let val = trimmed.slice(eqIdx + 1).trim();
          if (
            (val.startsWith('"') && val.endsWith('"')) ||
            (val.startsWith("'") && val.endsWith("'"))
          ) {
            val = val.slice(1, -1);
          }
          if (val) {
            result[key] = val;
          }
        }
      }
    }
  } catch {
    // ignore read errors, fall back to process.env
  }

  return result;
}

export function getFreshEnvVar(key: string): string | undefined {
  const env = getFreshEnv();
  return env[key];
}
