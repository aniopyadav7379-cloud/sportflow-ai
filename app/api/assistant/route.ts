import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { groqChat, GroqError, ChatMessage } from "@/lib/groq";
import { ok, fail, withApi } from "@/lib/api";

const schema = z.object({
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().min(1).max(2000) }))
    .min(1)
    .max(20),
});

async function buildContext() {
  const [clubs, players, matches, upcomingMatches, venues] = await Promise.all([
    prisma.club.count(),
    prisma.player.count(),
    prisma.match.count(),
    prisma.match.findMany({
      where: { status: "Upcoming" },
      orderBy: { date: "asc" },
      take: 5,
      select: { homeTeam: true, awayTeam: true, date: true },
    }),
    prisma.venue.findMany({ select: { name: true, utilization: true }, orderBy: { utilization: "desc" }, take: 5 }),
  ]);

  return `Live platform snapshot (use this to ground your answers, don't invent numbers beyond it):
- Clubs: ${clubs}, Players: ${players}, Matches recorded: ${matches}
- Next upcoming matches: ${upcomingMatches.map((m) => `${m.homeTeam} vs ${m.awayTeam} (${m.date.toDateString()})`).join("; ") || "none scheduled"}
- Venue utilization (top 5): ${venues.map((v) => `${v.name} ${v.utilization}%`).join(", ") || "no venues yet"}`;
}

const SYSTEM_PROMPT = `You are the SportFlow AI Assistant, a sports operations copilot embedded in a club/league management platform. You help with: scheduling matches, finding available venues, predicting player injury risk (qualitatively, not medically diagnostic), recommending scouting targets, and analyzing performance/attendance trends. Be concise, concrete, and use the live platform data given to you when relevant. If asked something outside sports operations, politely redirect. If the platform data doesn't cover something, say so rather than inventing figures.`;

export const POST = withApi(
  async (req) => {
    const body = schema.parse(await req.json());
    const context = await buildContext();

    const messages: ChatMessage[] = [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "system", content: context },
      ...body.messages.map((m) => ({ role: m.role, content: m.content })),
    ];

    try {
      const reply = await groqChat(messages);
      return ok({ reply });
    } catch (err) {
      if (err instanceof GroqError) return fail(err.message, err.status);
      throw err;
    }
  },
  { minRole: "VIEWER", limit: 20 }
);
