import ConfigManager from "@/components/ConfigManager";
import ConfigGuide from "@/components/ConfigGuide";
import BackLink from "@/components/BackLink";
import T from "@/components/T";

export const dynamic = "force-dynamic";

export default function ConfigPage() {
  return (
    <main style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 20px" }}>
      <div style={{ marginBottom: 8 }}>
        <BackLink />
        <h1 style={{ fontSize: "1.75rem", margin: "6px 0 0" }}><T k="config.title" /></h1>
      </div>
      <ConfigGuide />
      <ConfigManager />
    </main>
  );
}
