import GlossaryList from "@/components/GlossaryList";
import BackLink from "@/components/BackLink";
import T from "@/components/T";

export const dynamic = "force-dynamic";

export default function GlossaryPage() {
  return (
    <main style={{ maxWidth: 880, margin: "0 auto", padding: "32px 20px" }}>
      <div style={{ marginBottom: 8 }}>
        <BackLink />
        <h1 style={{ fontSize: "1.4rem", margin: "6px 0 0" }}><T k="glossary.title" /></h1>
      </div>
      <p style={{ color: "var(--text-muted)", marginBottom: 20, fontSize: "0.9rem" }}>
        <T k="glossary.intro" />
      </p>
      <GlossaryList />
    </main>
  );
}
