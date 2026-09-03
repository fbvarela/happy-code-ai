import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ConfigManager from "@/components/ConfigManager";
import ConfigGuide from "@/components/ConfigGuide";
import T from "@/components/T";

export const dynamic = "force-dynamic";

export default function ConfigPage() {
  return (
    <div className="main-content">
      <div className="page-header">
        <h1><T k="config.title" /></h1>
        <Link href="/" style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "inline-flex", alignItems: "center", gap: 4 }}><ArrowLeft size={14} /> <T k="nav.back" /></Link>
      </div>
      <ConfigGuide />
      <ConfigManager />
    </div>
  );
}
