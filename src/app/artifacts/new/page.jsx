import ArtifactEditor from "@/components/ArtifactEditor";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageToggle from "@/components/LanguageToggle";
import T from "@/components/T";

export const dynamic = "force-dynamic";

export default function NewArtifactPage() {
  return (
    <div className="main-content">
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <h1><T k="page.newArtifact" /></h1>
          <Link href="/" style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "inline-flex", alignItems: "center", gap: 4 }}><ArrowLeft size={14} /> <T k="nav.back" /></Link>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>
      <ArtifactEditor />
    </div>
  );
}
