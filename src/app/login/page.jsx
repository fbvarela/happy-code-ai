import T from "@/components/T";

export const dynamic = "force-dynamic";

const ERROR_CODES = ["oauth_state", "oauth_failed", "server_misconfigured"];

export default async function LoginPage({ searchParams }) {
  const params = await searchParams;
  const next = params?.next || "/";
  const errorKey = params?.error
    ? `login.err.${ERROR_CODES.includes(params.error) ? params.error : "generic"}`
    : null;
  const authHref = `/api/auth/github?next=${encodeURIComponent(next)}`;

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 20 }}>
      <div className="card" style={{ padding: 32, width: "100%", maxWidth: 400, textAlign: "center" }}>
        <h1 style={{ fontSize: "1.6rem", marginBottom: 6 }}>Happy Code</h1>
        <p style={{ color: "var(--text-muted)", marginBottom: 24 }}><T k="app.tagline" /></p>

        {errorKey && (
          <p style={{ color: "var(--clay)", marginBottom: 16, fontSize: "0.9rem" }}><T k={errorKey} /></p>
        )}

        <a className="btn btn-bark" href={authHref} style={{ width: "100%" }}>
          <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z" />
          </svg>
          <T k="login.continueGithub" />
        </a>

        <p style={{ marginTop: 16, fontSize: "0.8rem", color: "var(--text-muted)" }}>
          <T k="login.scopeNote" />
        </p>
      </div>
    </main>
  );
}
