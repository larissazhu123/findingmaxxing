import { requireSupabaseUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createMocks } from "node-mocks-http";
import handler from "./updatePoints";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    app_user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock("@/lib/auth", () => ({
  requireSupabaseUser: jest.fn(),
}));

describe("/api/user/updatePoints", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns 405 if method is not POST", async () => {
    const { req, res } = createMocks({ method: "GET" });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    expect(JSON.parse(res._getData())).toEqual({
      error: "Method not allowed",
    });
  });

  it("returns 401 if user is not authenticated", async () => {
    (requireSupabaseUser as jest.Mock).mockResolvedValue({
      user: null,
      error: "Unauthorized",
    });

    const { req, res } = createMocks({ method: "POST" });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(401);
    expect(JSON.parse(res._getData())).toEqual({
      error: "Unauthorized",
    });
  });

  it("returns 400 if current user points are invalid", async () => {
    (requireSupabaseUser as jest.Mock).mockResolvedValue({
      user: { id: "user-123" },
      error: null,
    });

    (prisma.app_user.findUnique as jest.Mock).mockResolvedValue({
      id: "user-123",
      points: undefined,
    });

    const { req, res } = createMocks({
      method: "POST",
      body: { pointsAwarded: 10 },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({
      error: "Invalid type for user points",
    });
  });

  it("returns 400 if pointsAwarded is missing", async () => {
    (requireSupabaseUser as jest.Mock).mockResolvedValue({
      user: { id: "user-123" },
      error: null,
    });

    (prisma.app_user.findUnique as jest.Mock).mockResolvedValue({
      id: "user-123",
      points: 20,
    });

    const { req, res } = createMocks({
      method: "POST",
      body: {},
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({
      error: "Invalid type for points Awarded",
    });
  });

  it("updates points successfully", async () => {
    const mockUpdatedUser = {
      id: "user-123",
      points: 35,
    };

    (requireSupabaseUser as jest.Mock).mockResolvedValue({
      user: { id: "user-123" },
      error: null,
    });

    (prisma.app_user.findUnique as jest.Mock).mockResolvedValue({
      id: "user-123",
      points: 20,
    });

    (prisma.app_user.update as jest.Mock).mockResolvedValue(mockUpdatedUser);

    const { req, res } = createMocks({
      method: "POST",
      body: { pointsAwarded: 15 },
    });

    await handler(req, res);

    expect(prisma.app_user.update).toHaveBeenCalledWith({
      where: { id: "user-123" },
      data: {
        points: 35,
        updated_at: expect.any(Date),
      },
    });

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({
      ok: true,
      user: mockUpdatedUser,
    });
  });

  it("returns 500 if prisma update fails", async () => {
    (requireSupabaseUser as jest.Mock).mockResolvedValue({
      user: { id: "user-123" },
      error: null,
    });

    (prisma.app_user.findUnique as jest.Mock).mockResolvedValue({
      id: "user-123",
      points: 20,
    });

    (prisma.app_user.update as jest.Mock).mockRejectedValue(
      new Error("DB error")
    );

    const { req, res } = createMocks({
      method: "POST",
      body: { pointsAwarded: 10 },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(JSON.parse(res._getData())).toEqual({
      error: "Failed to update points",
    });
  });
});