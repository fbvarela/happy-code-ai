import ArtifactEditor from "@/components/ArtifactEditor";
import T from "@/components/T";

export const dynamic = "force-dynamic";

export default function NewArtifactPage() {
  return (
    <main style={{ maxWidth: 1040, margin: "0 auto", padding: "32px 20px" }}>
      <h1 style={{ fontSize: "1.4rem", marginBottom: 20 }}><T k="page.newArtifact" /></h1>
      <ArtifactEditor />
    </main>
  );
}
