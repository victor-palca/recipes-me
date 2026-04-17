import { execSync } from "node:child_process";
import * as dotenv from "dotenv";

export async function setup() {
  dotenv.config({ path: ".env.test", override: true });
  execSync("npx prisma migrate deploy", {
    env: { ...process.env },
    stdio: "inherit",
  });
}
