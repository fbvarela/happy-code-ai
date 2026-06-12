import { requireAuth } from "@/utils/auth";

export async function GET() {
  const { session, error } = await requireAuth();
  if (error) return error;

  return Response.json({
    id: session.userId,
    githubLogin: session.githubLogin,
    name: session.name,
    avatarUrl: session.avatarUrl,
  });
}
