import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const outputRoot = new URL("../docs/", import.meta.url);
const notice = `<aside class="site-safety-notice" role="note" aria-label="Important information notice"><strong>AI-generated educational information — verify before acting.</strong> This site can be incomplete, outdated, or mistaken. It is not legal, financial, tax, credit, benefits, medical, or other professional advice. Buyer beware: independently verify every material fact, fee, promise, contract, and deadline with official sources and a qualified professional before you pay, sign, transfer property, borrow, settle, or file anything.</aside>`;

async function htmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return htmlFiles(path);
    return entry.isFile() && entry.name === "index.html" ? [path] : [];
  }));
  return nested.flat();
}

for (const path of await htmlFiles(outputRoot.pathname)) {
  const html = await readFile(path, "utf8");
  if (html.includes('class="site-safety-notice"')) continue;
  const updated = html.replace(/(<h1\b[^>]*>.*?<\/h1>)/, `$1${notice}`);
  if (updated === html) throw new Error(`Could not place notice in ${path}`);
  await writeFile(path, updated);
}
