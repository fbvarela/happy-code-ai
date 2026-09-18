import { getSession } from "@/lib/session";
import ArtifactLibrary from "@/components/ArtifactLibrary";
import T from "@/components/T";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  await getSession(); // touched for parity with middleware auth; identity lives in the sidebar footer

  return (
    <main style={{ maxWidth: 880, margin: "0 auto", padding: "40px 20px" }}>
      <header style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: "1.8rem", marginBottom: 2 }}>Happy Code</h1>
        <p style={{ color: "var(--text-muted)" }}><T k="app.tagline" /></p>
      </header>

      <ArtifactLibrary />
    </main>
  );
}
