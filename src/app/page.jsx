import { getSession } from "@/lib/session";
import ArtifactLibrary from "@/components/ArtifactLibrary";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageToggle from "@/components/LanguageToggle";
import T from "@/components/T";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await getSession();

  return (
    <div className="main-content">
      <div className="page-header">
        <div>
          <h1><T k="app.title" /></h1>
          <p className="page-header-meta"><T k="app.tagline" /></p>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>
      <div className="scroll-list">
        <ArtifactLibrary />
      </div>
    </div>
  );
}
