import type { NextApiRequest, NextApiResponse } from "next";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { requireSupabaseUser } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") return list(req, res);
  if (req.method === "POST") return create(req, res);
  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ error: "Method not allowed" });
}

async function list(req: NextApiRequest, res: NextApiResponse) {
  const status = typeof req.query.status === "string" ? req.query.status : "active";
  const limit = Math.min(Number(req.query.limit) || 100, 500);

  try {
    const listings = await prisma.listing.findMany({
      where: { status },
      orderBy: { created_at: "desc" },
      take: limit,
      include: { category: true, listing_photo: { orderBy: { sort_order: "asc" } } },
    });
    return res.status(200).json(listings);
  } catch (e) {
    console.error("[listings.list]", e);
    return res.status(500).json({ error: "Server error" });
  }
}

async function create(req: NextApiRequest, res: NextApiResponse) {
  const { user, error } = await requireSupabaseUser(req);
  if (error || !user) return res.status(401).json({ error: "Unauthorized" });

  const {
    title,
    description,
    category_id,
    lat,
    lng,
    place_name,
    manual_address,
    image_url,
    expires_at,
  } = req.body ?? {};

  if (!title || typeof lat !== "number" || typeof lng !== "number" || !expires_at) {
    return res.status(400).json({ error: "title, lat, lng, expires_at are required" });
  }

  try {
    const listing = await prisma.listing.create({
      data: {
        id: randomUUID(),
        finder_user_id: user.id,
        title,
        description: description ?? null,
        category_id: category_id ?? null,
        lat,
        lng,
        place_name: place_name ?? null,
        manual_address: manual_address ?? null,
        image_url: image_url ?? null,
        expires_at: new Date(expires_at),
      },
    });
    return res.status(201).json(listing);
  } catch (e) {
    console.error("[listings.create]", e);
    return res.status(500).json({ error: "Server error" });
  }
}
