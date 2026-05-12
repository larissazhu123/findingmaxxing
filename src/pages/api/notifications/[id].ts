import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { requireSupabaseUser } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = typeof req.query.id === "string" ? req.query.id : null;
  if (!id) return res.status(400).json({ error: "Missing notification id" });

  const { user, error } = await requireSupabaseUser(req);
  if (error || !user) return res.status(401).json({ error: "Unauthorized" });

  if (req.method === "GET") {
    try {
      const notif = await prisma.notification.findUnique({ where: { id } });
      if (!notif) return res.status(404).json({ error: "Not found" });
      if (notif.user_id !== user.id) return res.status(403).json({ error: "Forbidden" });
      return res.status(200).json(notif);
    } catch (e) {
      console.error("[notifications.get]", e);
      return res.status(500).json({ error: "Server error" });
    }
  }

  if (req.method === "PATCH") {
    try {
      const existing = await prisma.notification.findUnique({ where: { id } });
      if (!existing) return res.status(404).json({ error: "Not found" });
      if (existing.user_id !== user.id) return res.status(403).json({ error: "Forbidden" });

      const updated = await prisma.notification.update({
        where: { id },
        data: { status: "read", sent_at: existing.sent_at ?? new Date() },
      });
      return res.status(200).json(updated);
    } catch (e) {
      console.error("[notifications.patch]", e);
      return res.status(500).json({ error: "Server error" });
    }
  }

  res.setHeader("Allow", "GET, PATCH");
  return res.status(405).json({ error: "Method not allowed" });
}
