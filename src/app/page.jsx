import { getSession } from "@/lib/session";
import ArtifactLibrary from "@/components/ArtifactLibrary";
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
      </div>
      <div className="scroll-list">
        <ArtifactLibrary />
      </div>
    </div>
  );
}
