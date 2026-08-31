import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const findMany = vi.fn().mockResolvedValue([]);

vi.mock("@/lib/db", () => ({
  getDb: () => ({ article: { findMany } }),
}));

describe("content repository", () => {
  beforeEach(() => {
    findMany.mockClear();
    vi.stubEnv("DATABASE_URL", "postgresql://example.invalid/test");
  });

  afterEach(() => vi.unstubAllEnvs());

  it("publishes scheduled articles once their publication time has passed", async () => {
    const { getArticles } = await import("@/lib/content/repository");

    await getArticles();

    expect(findMany).toHaveBeenCalledOnce();
    expect(findMany).toHaveBeenCalledWith({
      where: {
        OR: [
          { status: "PUBLISHED", publishedAt: { lte: expect.any(Date) } },
          { status: "SCHEDULED", publishedAt: { lte: expect.any(Date) } },
        ],
      },
      orderBy: { publishedAt: "desc" },
    });
  });
});
