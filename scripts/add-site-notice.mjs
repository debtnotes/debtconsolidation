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
  let updated = html;
  updated = updated.replace(
    /<details class="sidebar-collapse">(<summary class="sidebar-group-summary" aria-expanded=")false("[^>]*><span id="sidebar-group-\d+-label">Act now<\/span>)/g,
    '<details class="sidebar-collapse" open>$1true$2',
  );
  if (!updated.includes('class="skip-link"')) {
    updated = updated.replace("<body>", '<body><a class="skip-link" href="#main-content">Skip to main content</a>');
    updated = updated.replace('<main class="doc-main">', '<main id="main-content" class="doc-main" tabindex="-1">');
  }
  if (!updated.includes('class="site-safety-notice"')) {
    updated = updated.replace("</header>", `${notice}</header>`);
  }
  if (updated === html) throw new Error(`Could not add page safeguards to ${path}`);
  await writeFile(path, updated);
}

await writeFile(join(outputRoot.pathname, "robots.txt"), robots);
