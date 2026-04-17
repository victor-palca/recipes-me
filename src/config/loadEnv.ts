import { config } from "dotenv";
import { existsSync } from "node:fs";
import path from "node:path";

const root = process.cwd();

function loadFile(rel: string, override: boolean) {
  const full = path.join(root, rel);
  if (existsSync(full)) {
    config({ path: full, override });
  }
}

/**
 * Ordem (valores já definidos no ambiente do processo, ex.: CI/hosting, não são sobrescritos pelo `.env`):
 * 1. `.env` — base local
 * 2. `.env.local` — overrides pessoais (gitignored)
 * 3. `.env.${NODE_ENV}` — ex.: `.env.development` / `.env.production` (gitignored)
 */
export function loadEnv(): void {
  loadFile(".env", false);
  loadFile(".env.local", true);
  const nodeEnv = process.env.NODE_ENV ?? "development";
  loadFile(`.env.${nodeEnv}`, true);
}
