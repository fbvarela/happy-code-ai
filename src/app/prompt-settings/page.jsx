import PromptManager from "@/components/PromptManager";
import BackLink from "@/components/BackLink";
import T from "@/components/T";

export const dynamic = "force-dynamic";

export default function PromptSettingsPage() {
  return (
    <main style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 20px" }}>
      <div style={{ marginBottom: 8 }}>
        <BackLink />
        <h1 style={{ fontSize: "1.75rem", margin: "6px 0 0" }}><T k="promptSettings.title" /></h1>
      </div>
      <PromptManager />
    </main>
  );
}