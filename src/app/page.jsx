import { getSession } from "@/lib/session";
import LogoutButton from "@/components/LogoutButton";
import ArtifactLibrary from "@/components/ArtifactLibrary";
import T from "@/components/T";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await getSession();

  return (
    <main style={{ maxWidth: 880, margin: "0 auto", padding: "40px 20px" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", marginBottom: 2 }}>Happy Code</h1>
          <p style={{ color: "var(--text-muted)" }}><T k="app.tagline" /></p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {session.avatarUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={session.avatarUrl} alt="" width={36} height={36} style={{ borderRadius: "50%" }} />
          )}
          <span style={{ color: "var(--text-muted)" }}>@{session.githubLogin}</span>
          <LogoutButton />
        </div>
      </header>

      <ArtifactLibrary />
    </main>
  );
}
