import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { requireSupabaseUser } from "@/lib/auth";

const ALLOWED_STATUS = new Set(["pending", "accepted", "rejected", "cancelled"]);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = typeof req.query.id === "string" ? req.query.id : null;
  if (!id) return res.status(400).json({ error: "Missing claim id" });

  const { user, error } = await requireSupabaseUser(req);
  if (error || !user) return res.status(401).json({ error: "Unauthorized" });

  if (req.method === "GET") {
    try {
      const claim = await prisma.claim.findUnique({
        where: { id },
        include: { listing: true, app_user: true },
      });
      if (!claim) return res.status(404).json({ error: "Claim not found" });

      const isClaimer = claim.claimer_user_id === user.id;
      const isFinder = claim.listing.finder_user_id === user.id;
      if (!isClaimer && !isFinder) return res.status(403).json({ error: "Forbidden" });

      return res.status(200).json(claim);
    } catch (e) {
      console.error("[claims.get]", e);
      return res.status(500).json({ error: "Server error" });
    }
  }

  if (req.method === "PATCH") {
    const { status } = req.body ?? {};
    if (!status || !ALLOWED_STATUS.has(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    try {
      const existing = await prisma.claim.findUnique({
        where: { id },
        include: { listing: { select: { finder_user_id: true } } },
      });
      if (!existing) return res.status(404).json({ error: "Claim not found" });
      if (existing.listing.finder_user_id !== user.id) {
        return res.status(403).json({ error: "Only the listing finder can update claim status" });
      }

      const updated = await prisma.claim.update({ where: { id }, data: { status } });
      return res.status(200).json(updated);
    } catch (e) {
      console.error("[claims.patch]", e);
      return res.status(500).json({ error: "Server error" });
    }
  }

  res.setHeader("Allow", "GET, PATCH");
  return res.status(405).json({ error: "Method not allowed" });
}
