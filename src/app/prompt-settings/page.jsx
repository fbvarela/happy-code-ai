import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import PromptManager from "@/components/PromptManager";
import T from "@/components/T";

export const dynamic = "force-dynamic";

export default function PromptSettingsPage() {
  return (
    <main style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, marginBottom: 8 }}>
        <h1 style={{ fontSize: "1.75rem" }}><T k="promptSettings.title" /></h1>
        <Link href="/" style={{ fontSize: "0.95rem", color: "var(--text-muted)", display: "inline-flex", alignItems: "center", gap: 4 }}>
          <ArrowLeft size={14} /> <T k="nav.back" />
        </Link>
      </div>
      <PromptManager />
    </main>
  );
}