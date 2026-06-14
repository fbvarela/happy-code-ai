import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import GlossaryList from "@/components/GlossaryList";

export const dynamic = "force-dynamic";

export default function GlossaryPage() {
  return (
    <main style={{ maxWidth: 880, margin: "0 auto", padding: "32px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, marginBottom: 8 }}>
        <h1 style={{ fontSize: "1.4rem" }}>Glosario de IA</h1>
        <Link href="/" style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "inline-flex", alignItems: "center", gap: 4 }}><ArrowLeft size={14} /> Volver</Link>
      </div>
      <p style={{ color: "var(--text-muted)", marginBottom: 20, fontSize: "0.9rem" }}>
        Términos de IA y agentes de programación, con enlaces a las herramientas más usadas.
        Añade los tuyos: si dejas la definición vacía, la genera Groq.
      </p>
      <GlossaryList />
    </main>
  );
}
