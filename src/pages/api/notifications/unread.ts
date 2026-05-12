import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { requireSupabaseUser } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { user, error } = await requireSupabaseUser(req);
  if (error || !user) return res.status(401).json({ error: "Unauthorized" });

  try {
    const [items, count] = await Promise.all([
      prisma.notification.findMany({
        where: { user_id: user.id, status: { not: "read" } },
        orderBy: { created_at: "desc" },
        take: 100,
      }),
      prisma.notification.count({
        where: { user_id: user.id, status: { not: "read" } },
      }),
    ]);

    return res.status(200).json({ count, items });
  } catch (e) {
    console.error("[notifications.unread]", e);
    return res.status(500).json({ error: "Server error" });
  }
}
