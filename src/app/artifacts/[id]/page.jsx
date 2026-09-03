import ArtifactEditor from "@/components/ArtifactEditor";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import T from "@/components/T";

export const dynamic = "force-dynamic";

export default async function EditArtifactPage({ params }) {
  const { id } = await params;
  return (
    <div className="main-content">
      <div className="page-header">
        <h1><T k="page.editArtifact" /></h1>
        <Link href="/" style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "inline-flex", alignItems: "center", gap: 4 }}><ArrowLeft size={14} /> <T k="nav.back" /></Link>
      </div>
      <div className="scroll-list">
        <ArtifactEditor id={id} />
      </div>
    </div>
  );
}
