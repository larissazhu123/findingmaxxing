import { requireSupabaseUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createMocks } from "node-mocks-http";
import handler from "./me";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    app_user: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock("@/lib/auth", () => ({
  requireSupabaseUser: jest.fn(),
}));

describe("/api/user/me", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns 405 if method is not GET", async () => {
    const { req, res } = createMocks({ method: "POST" });

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

    const { req, res } = createMocks({ method: "GET" });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(401);
    expect(JSON.parse(res._getData())).toEqual({
      error: "Unauthorized",
    });
  });

  it("returns 404 if profile not found", async () => {
    (requireSupabaseUser as jest.Mock).mockResolvedValue({
      user: { id: "user-123" },
      error: null,
    });

    (prisma.app_user.findUnique as jest.Mock).mockResolvedValue(null);

    const { req, res } = createMocks({ method: "GET" });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(404);
    expect(JSON.parse(res._getData())).toEqual({
      error: "Profile not found",
    });
  });

  it("returns 200 with user profile", async () => {
    const mockProfile = {
      id: "user-123",
      email: "test@example.com",
      username: "meta",
    };

    (requireSupabaseUser as jest.Mock).mockResolvedValue({
      user: { id: "user-123" },
      error: null,
    });

    (prisma.app_user.findUnique as jest.Mock).mockResolvedValue(mockProfile);

    const { req, res } = createMocks({ method: "GET" });

    await handler(req, res);

    expect(prisma.app_user.findUnique).toHaveBeenCalledWith({
      where: { id: "user-123" },
    });

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual(mockProfile);
  });

  it("returns 500 if database throws error", async () => {
    (requireSupabaseUser as jest.Mock).mockResolvedValue({
      user: { id: "user-123" },
      error: null,
    });

    (prisma.app_user.findUnique as jest.Mock).mockRejectedValue(
      new Error("DB error")
    );

    const { req, res } = createMocks({ method: "GET" });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(JSON.parse(res._getData())).toEqual({
      error: "Server error",
    });
  });
});