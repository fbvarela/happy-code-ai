import GlossaryDetail from "@/components/GlossaryDetail";

export const dynamic = "force-dynamic";

export default async function GlossaryTermPage({ params }) {
  const { id } = await params;
  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "32px 20px" }}>
      <GlossaryDetail id={id} />
    </main>
  );
}
