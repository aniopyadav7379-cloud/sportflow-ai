describe("groqChat", () => {
  const originalKey = process.env.GROQ_API_KEY;

  afterEach(() => {
    process.env.GROQ_API_KEY = originalKey;
    jest.resetModules();
  });

  it("throws a friendly, actionable error when GROQ_API_KEY is missing", async () => {
    delete process.env.GROQ_API_KEY;
    jest.resetModules();
    const { groqChat, GroqError } = await import("@/lib/groq");

    await expect(groqChat([{ role: "user", content: "hi" }])).rejects.toThrow(GroqError);
    await expect(groqChat([{ role: "user", content: "hi" }])).rejects.toThrow(/GROQ_API_KEY/);
  });
});
