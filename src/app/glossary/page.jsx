import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import GlossaryList from "@/components/GlossaryList";
import T from "@/components/T";

export const dynamic = "force-dynamic";

export default function GlossaryPage() {
  return (
    <main style={{ maxWidth: 880, margin: "0 auto", padding: "32px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, marginBottom: 8 }}>
        <h1 style={{ fontSize: "1.4rem" }}><T k="glossary.title" /></h1>
        <Link href="/" style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "inline-flex", alignItems: "center", gap: 4 }}><ArrowLeft size={14} /> <T k="nav.back" /></Link>
      </div>
      <p style={{ color: "var(--text-muted)", marginBottom: 20, fontSize: "0.9rem" }}>
        <T k="glossary.intro" />
      </p>
      <GlossaryList />
    </main>
  );
}
