import Link from "next/link";
import SuggestionGallery from "@/components/SuggestionGallery";

export const dynamic = "force-dynamic";

export default function SuggestionsPage() {
  return (
    <main style={{ maxWidth: 1040, margin: "0 auto", padding: "32px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, marginBottom: 8 }}>
        <h1 style={{ fontSize: "1.4rem" }}>Sugerencias para programadores</h1>
        <Link href="/" style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>← Volver</Link>
      </div>
      <p style={{ color: "var(--text-muted)", marginBottom: 20, fontSize: "0.9rem" }}>
        Artefactos listos para usar en tareas de programación. Elige uno, ajústalo y guárdalo.
      </p>
      <SuggestionGallery />
    </main>
  );
}
