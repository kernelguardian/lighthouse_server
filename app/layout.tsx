export const metadata = {
  title: "Lighthouse Bible API",
  description: "Manifest + SQLite Bible file delivery for the Lighthouse Bible Database Collection.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
