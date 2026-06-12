import ArtifactEditor from "@/components/ArtifactEditor";

export const dynamic = "force-dynamic";

export default function NewArtifactPage() {
  return (
    <main style={{ maxWidth: 1040, margin: "0 auto", padding: "32px 20px" }}>
      <h1 style={{ fontSize: "1.4rem", marginBottom: 20 }}>Nuevo artefacto</h1>
      <ArtifactEditor />
    </main>
  );
}
