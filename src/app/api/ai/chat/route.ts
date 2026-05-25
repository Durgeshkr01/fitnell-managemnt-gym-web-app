import { NextResponse } from "next/server";

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type ChatRequest = {
  messages?: ChatMessage[];
};

const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = "llama-3.1-8b-instant";

const SYSTEM_PROMPT = `You are SG Fitness AI. You help admins, trainers, and members by:
- Answering fitness, gym operations, and member questions.
- Generating workout or diet plans when asked.
- Asking for missing details when required.
Rules:
- Keep responses practical and safe.
- Avoid medical claims and diagnose suggestions.
- End plans with a short safety disclaimer.`;

export async function POST(request: Request) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GROQ_API_KEY is not configured." },
      { status: 500 }
    );
  }

  let payload: ChatRequest;
  try {
    payload = (await request.json()) as ChatRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const incomingMessages = payload.messages ?? [];
  if (!Array.isArray(incomingMessages) || incomingMessages.length === 0) {
    return NextResponse.json(
      { error: "Messages are required." },
      { status: 400 }
    );
  }

  const trimmedMessages = incomingMessages
    .filter((message) => message?.content?.trim())
    .slice(-18);

  const response = await fetch(GROQ_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...trimmedMessages],
      temperature: 0.6,
      max_tokens: 900,
    }),
  });

  if (!response.ok) {
    let errorText = await response.text();
    try {
      const parsed = JSON.parse(errorText) as { error?: { message?: string } };
      if (parsed?.error?.message) {
        errorText = parsed.error.message;
      }
    } catch {
      // Keep raw response text when not JSON.
    }
    return NextResponse.json(
      {
        error: "Groq request failed.",
        detail: errorText,
        status: response.status,
      },
      { status: 500 }
    );
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) {
    return NextResponse.json(
      { error: "No response returned from Groq." },
      { status: 500 }
    );
  }

  return NextResponse.json({ reply: content });
}
