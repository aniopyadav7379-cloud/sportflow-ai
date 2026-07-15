// Thin client for Groq's OpenAI-compatible chat completions endpoint.
// Docs: https://console.groq.com/docs/api-reference#chat-create
// Get a free API key at https://console.groq.com/keys

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export class GroqError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function groqChat(messages: ChatMessage[], opts?: { temperature?: number; maxTokens?: number }) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new GroqError(
      "AI Assistant isn't configured yet — add a GROQ_API_KEY in your .env (free at console.groq.com/keys) and restart the server.",
      503
    );
  }

  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      messages,
      temperature: opts?.temperature ?? 0.4,
      max_tokens: opts?.maxTokens ?? 700,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new GroqError(`Groq API error (${res.status}): ${body.slice(0, 300)}`, res.status);
  }

  const json = await res.json();
  const reply: string | undefined = json.choices?.[0]?.message?.content;
  if (!reply) throw new GroqError("Groq returned an empty response.", 502);
  return reply;
}
