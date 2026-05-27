import manifest from "@/assets/manifest.json";

export const runtime = "edge";

type Bible = { file: { path: string } };

const allowed = new Set<string>(
  (manifest.bibles as Bible[]).map((b) => b.file.path),
);

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ file: string }> },
) {
  const { file } = await params;
  const path = `bibles/${file}`;

  if (!allowed.has(path)) {
    return new Response("Not found", { status: 404 });
  }

  const base = process.env.BLOB_PUBLIC_BASE;
  if (!base) {
    return new Response("Misconfigured: BLOB_PUBLIC_BASE not set", { status: 500 });
  }

  const upstream = await fetch(`${base}/${path}`, { cache: "force-cache" });
  if (!upstream.ok || !upstream.body) {
    return new Response("Upstream error", { status: 502 });
  }

  const headers = new Headers({
    "content-type": "application/vnd.sqlite3",
    "cache-control": "public, max-age=31536000, immutable, s-maxage=31536000",
  });
  const len = upstream.headers.get("content-length");
  if (len) headers.set("content-length", len);
  const upstreamEtag = upstream.headers.get("etag");
  if (upstreamEtag) headers.set("etag", upstreamEtag);

  return new Response(upstream.body, { headers });
}
