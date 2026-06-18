import T from "@/components/T";

export const metadata = { title: "Sin conexión — Happy Code" };

export default function OfflinePage() {
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 20, textAlign: "center" }}>
      <div className="card" style={{ padding: 32, maxWidth: 360 }}>
        <h1 style={{ fontSize: "1.4rem", marginBottom: 8 }}><T k="offline.title" /></h1>
        <p style={{ color: "var(--text-muted)" }}>
          <T k="offline.body" />
        </p>
      </div>
    </main>
  );
}
