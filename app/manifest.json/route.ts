import manifest from "@/assets/manifest.json";

export const runtime = "edge";
export const dynamic = "force-static";

const body = JSON.stringify(manifest);
const etag = `"v${manifest.schema_version}-${manifest.generated_at}"`;

export function GET() {
  return new Response(body, {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control":
        "public, max-age=300, s-maxage=31536000, stale-while-revalidate=86400",
      etag,
    },
  });
}
