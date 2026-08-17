import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const outputRoot = new URL("../docs/", import.meta.url);
const notice = `<aside class="site-safety-notice" role="note" aria-label="Important information notice"><strong>AI-generated content may be mistaken.</strong> Verify facts, fees, deadlines, and contracts yourself; this is not professional advice. Buyer beware.</aside>`;
const robots = "User-agent: *\nDisallow: /\n";

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
  const updated = html.replace("</header>", `${notice}</header>`);
  if (updated === html) throw new Error(`Could not place notice in ${path}`);
  await writeFile(path, updated);
}

await writeFile(join(outputRoot.pathname, "robots.txt"), robots);
