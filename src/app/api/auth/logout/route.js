import { getSession } from "@/lib/session";

export async function POST() {
  const session = await getSession();
  session.destroy();
  return Response.json({ message: "Logged out" });
}
