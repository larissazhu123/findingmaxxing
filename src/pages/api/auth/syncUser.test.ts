import { requireSupabaseUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createMocks } from "node-mocks-http";
import handler from "./syncUser";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    app_user: {
      upsert: jest.fn(),
    },
  },
}));

jest.mock("@/lib/auth", () => ({
  requireSupabaseUser: jest.fn(),
}));

describe("/api/auth/syncUser", () => {
  beforeEach(() => {
    jest.clearAllMocks();
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

  it("syncs user and returns 200", async () => {
    const mockUser = {
      id: "user-123",
      email: "test@example.com",
    };

    const mockSyncedUser = {
      id: "user-123",
      email: "test@example.com",
      username: "user-random",
    };

    (requireSupabaseUser as jest.Mock).mockResolvedValue({
      user: mockUser,
      error: null,
    });

    (prisma.app_user.upsert as jest.Mock).mockResolvedValue(mockSyncedUser);

    const { req, res } = createMocks({ method: "POST" });

    await handler(req, res);

    expect(prisma.app_user.upsert).toHaveBeenCalledWith({
      where: { id: "user-123" },
      update: {
        email: "test@example.com",
        updated_at: expect.any(Date),
      },
      create: {
        id: "user-123",
        email: "test@example.com",
        username: expect.stringMatching(/^user-/),
      },
    });

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual(mockSyncedUser);
  });

  it("returns 500 if prisma fails", async () => {
    (requireSupabaseUser as jest.Mock).mockResolvedValue({
      user: {
        id: "user-123",
        email: "test@example.com",
      },
      error: null,
    });

    (prisma.app_user.upsert as jest.Mock).mockRejectedValue(
      new Error("Database error")
    );

    const { req, res } = createMocks({ method: "POST" });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(JSON.parse(res._getData())).toEqual({
      error: "Failed to sync user",
    });
  });
});