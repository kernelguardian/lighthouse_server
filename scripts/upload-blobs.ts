import { readFile, stat } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { head, put } from "@vercel/blob";
import manifest from "../assets/manifest.json" with { type: "json" };

const __dirname = dirname(fileURLToPath(import.meta.url));
const ASSETS_DIR = join(__dirname, "..", "assets");

type Bible = {
  id: string;
  file: { path: string; size_bytes: number; sha256: string };
};

async function main() {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    console.error("BLOB_READ_WRITE_TOKEN not set");
    process.exit(1);
  }

  const bibles = manifest.bibles as Bible[];
  console.log(`Uploading ${bibles.length} files…`);

  let uploaded = 0;
  let skipped = 0;
  let failed = 0;
  let firstUrl: string | null = null;

  for (const b of bibles) {
    const localPath = join(ASSETS_DIR, b.file.path);

    try {
      await stat(localPath);
    } catch {
      console.warn(`✗ missing local file: ${b.file.path}`);
      failed++;
      continue;
    }

    try {
      const existing = await head(b.file.path, { token });
      if (existing.size === b.file.size_bytes) {
        skipped++;
        if (!firstUrl) firstUrl = existing.url;
        process.stdout.write(`= ${b.file.path}\n`);
        continue;
      }
    } catch {
      // not found → proceed to upload
    }

    const buf = await readFile(localPath);
    const result = await put(b.file.path, buf, {
      access: "public",
      addRandomSuffix: false,
      contentType: "application/vnd.sqlite3",
      token,
      allowOverwrite: true,
    });

    if (!firstUrl) firstUrl = result.url;
    uploaded++;
    process.stdout.write(`↑ ${b.file.path}  ${result.url}\n`);
  }

  console.log(
    `\nDone. uploaded=${uploaded} skipped=${skipped} failed=${failed} total=${bibles.length}`,
  );

  if (firstUrl) {
    const u = new URL(firstUrl);
    console.log(`\nSet BLOB_PUBLIC_BASE to:  https://${u.host}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
