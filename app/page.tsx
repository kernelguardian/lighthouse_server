export default function Page() {
  return (
    <main style={{ fontFamily: "system-ui, sans-serif", padding: "2rem", maxWidth: 640 }}>
      <h1>Lighthouse Bible API</h1>
      <p>
        Manifest: <a href="/manifest.json">/manifest.json</a>
      </p>
      <p>
        Files: <code>/bibles/{`{uuid}`}.db</code>
      </p>
    </main>
  );
}
