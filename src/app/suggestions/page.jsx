import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import SuggestionGallery from "@/components/SuggestionGallery";
import T from "@/components/T";

export const dynamic = "force-dynamic";

export default function SuggestionsPage() {
  return (
    <div className="main-content">
      <div className="page-header">
        <div>
          <h1><T k="suggestions.title" /></h1>
          <p className="page-header-meta"><T k="suggestions.intro" /></p>
        </div>
        <Link href="/" style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "inline-flex", alignItems: "center", gap: 4 }}><ArrowLeft size={14} /> <T k="nav.back" /></Link>
      </div>
      <div className="scroll-list">
        <SuggestionGallery />
      </div>
    </div>
  );
}
