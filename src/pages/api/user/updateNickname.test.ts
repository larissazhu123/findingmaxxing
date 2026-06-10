import { requireSupabaseUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createMocks } from "node-mocks-http";
import handler from "./updateNickname";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    app_user: {
      update: jest.fn(),
    },
  },
}));

jest.mock("@/lib/auth", () => ({
  requireSupabaseUser: jest.fn(),
}));

describe("/api/user/updateNickname", () => {
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
  });

  it("returns 401 if user is not authenticated", async () => {
    (requireSupabaseUser as jest.Mock).mockResolvedValue({
      user: null,
      error: "Unauthorized",
    });

    const { req, res } = createMocks({ method: "POST" });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(401);
  });

  it("returns 400 if nickname is missing", async () => {
    (requireSupabaseUser as jest.Mock).mockResolvedValue({
      user: { id: "user-123" },
      error: null,
    });

    const { req, res } = createMocks({
      method: "POST",
      body: {},
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({
      error: "Nickname required",
    });
  });

  it("returns 400 if nickname is too short", async () => {
    (requireSupabaseUser as jest.Mock).mockResolvedValue({
      user: { id: "user-123" },
      error: null,
    });

    const { req, res } = createMocks({
      method: "POST",
      body: { newNickname: "ab" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({
      error: "Nickname must be at least 3 characters long",
    });
  });

  it("trims and updates nickname successfully", async () => {
    const mockUpdatedUser = {
      id: "user-123",
      username: "meta",
    };

    (requireSupabaseUser as jest.Mock).mockResolvedValue({
      user: { id: "user-123" },
      error: null,
    });

    (prisma.app_user.update as jest.Mock).mockResolvedValue(mockUpdatedUser);

    const { req, res } = createMocks({
      method: "POST",
      body: { newNickname: "   meta   " },
    });

    await handler(req, res);

    expect(prisma.app_user.update).toHaveBeenCalledWith({
      where: { id: "user-123" },
      data: {
        username: "meta",
        updated_at: expect.any(Date),
      },
    });

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({
      ok: true,
      user: mockUpdatedUser,
    });
  });

  it("limits nickname to 16 characters", async () => {
    const longName = "abcdefghijklmnopqr"; // >16 chars

    (requireSupabaseUser as jest.Mock).mockResolvedValue({
      user: { id: "user-123" },
      error: null,
    });

    (prisma.app_user.update as jest.Mock).mockResolvedValue({
      id: "user-123",
      username: longName.slice(0, 16),
    });

    const { req, res } = createMocks({
      method: "POST",
      body: { newNickname: longName },
    });

    await handler(req, res);

    expect(prisma.app_user.update).toHaveBeenCalledWith({
      where: { id: "user-123" },
      data: {
        username: longName.slice(0, 16),
        updated_at: expect.any(Date),
      },
    });

    expect(res._getStatusCode()).toBe(200);
  });

  it("returns 500 if prisma fails", async () => {
    (requireSupabaseUser as jest.Mock).mockResolvedValue({
      user: { id: "user-123" },
      error: null,
    });

    (prisma.app_user.update as jest.Mock).mockRejectedValue(
      new Error("DB error")
    );

    const { req, res } = createMocks({
      method: "POST",
      body: { newNickname: "meta" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(JSON.parse(res._getData())).toEqual({
      error: "Failed to update nickname",
    });
  });
});