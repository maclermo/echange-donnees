import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "url";

const filename = fileURLToPath(import.meta.url);
const source = join(dirname(filename), "..", "src", "views");
const destination = join(dirname(filename), "..", "dist", "src", "views");

rmSync(destination, { recursive: true, force: true });

if (existsSync(source)) {
  mkdirSync(dirname(destination), { recursive: true });
  cpSync(source, destination, { recursive: true });
}
