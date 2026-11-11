#!/usr/bin/env node
// One-off helper: ingest Google OAuth client JSON + Picker API key into .env.local
// WITHOUT printing them. Usage:
//   node scripts/set-google-env.mjs /path/to/client_secret_*.json
// The API key is prompted for silently (hidden input).
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import readline from "node:readline";
import { stdin, stdout } from "node:process";

const jsonPath = process.argv[2];
if (!jsonPath || !existsSync(jsonPath)) {
  console.error("Usage: node scripts/set-google-env.mjs /path/to/client_secret_*.json");
  process.exit(1);
}

const raw = JSON.parse(readFileSync(jsonPath, "utf8"));
const cred = raw.web ?? raw.installed;
if (!cred?.client_id || !cred?.client_secret) {
  console.error("That JSON does not look like a Google OAuth client credential.");
  process.exit(1);
}

function askHidden(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: stdin, output: stdout, terminal: true });
    const origWrite = rl._writeToOutput;
    rl._writeToOutput = function (chunk) { if (chunk.includes(question)) origWrite.call(rl, chunk); };
    rl.question(question, (answer) => { rl.close(); stdout.write("\n"); resolve(answer.trim()); });
  });
}

const apiKey = await askHidden("Paste the restricted Google API key (hidden): ");
if (!apiKey || apiKey.length < 20) { console.error("Key looks too short; aborting."); process.exit(1); }

const envPath = new URL("../.env.local", import.meta.url).pathname;
let env = readFileSync(envPath, "utf8");
function setVar(name, value) {
  const line = `${name}=${value}`;
  const re = new RegExp(`^${name}=.*$`, "m");
  env = re.test(env) ? env.replace(re, line) : env.trimEnd() + "\n" + line + "\n";
}
setVar("GOOGLE_CLIENT_ID", cred.client_id);
setVar("GOOGLE_CLIENT_SECRET", cred.client_secret);
setVar("GOOGLE_API_KEY", apiKey);
setVar("NEXT_PUBLIC_GOOGLE_API_KEY", apiKey);
writeFileSync(envPath, env, { mode: 0o600 });
console.log("OK: wrote GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_API_KEY, NEXT_PUBLIC_GOOGLE_API_KEY.");
console.log(`  client_id suffix: …${String(cred.client_id).slice(-20)}`);
console.log(`  secret length: ${cred.client_secret.length} chars (value not shown)`);
console.log(`  api key length: ${apiKey.length} chars (value not shown)`);
console.log("  restart the app so it picks up the new values.");
