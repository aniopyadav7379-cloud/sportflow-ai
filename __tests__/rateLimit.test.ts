import { rateLimit } from "@/lib/rateLimit";

describe("rateLimit", () => {
  it("allows requests under the limit", () => {
    const key = `test-${Math.random()}`;
    for (let i = 0; i < 5; i++) {
      expect(rateLimit(key, 5, 60_000).ok).toBe(true);
    }
  });

  it("blocks requests once the limit is exceeded", () => {
    const key = `test-${Math.random()}`;
    for (let i = 0; i < 3; i++) rateLimit(key, 3, 60_000);
    const result = rateLimit(key, 3, 60_000);
    expect(result.ok).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("resets after the window elapses", () => {
    const key = `test-${Math.random()}`;
    rateLimit(key, 1, 10);
    expect(rateLimit(key, 1, 10).ok).toBe(false);
    return new Promise((resolve) => {
      setTimeout(() => {
        expect(rateLimit(key, 1, 10).ok).toBe(true);
        resolve(null);
      }, 20);
    });
  });
});
