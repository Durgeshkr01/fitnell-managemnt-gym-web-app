import { NextResponse } from "next/server";

type PlanType = "diet" | "workout";

type PlanRequest = {
  type: PlanType;
  profile: {
    name?: string;
    dateOfBirth?: string;
    goal?: string;
    activityLevel?: string;
    height?: string;
    weight?: string;
    allergies?: string;
    equipment?: string;
    daysPerWeek?: number;
    sessionMinutes?: number;
    notes?: string;
  };
};

const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = "llama-3.1-8b-instant";

function buildPrompt(payload: PlanRequest) {
  const { type, profile } = payload;

  return `You are a fitness coach. Generate a ${type} plan with clear sections and bullet points.

Member profile:
- Name: ${profile.name ?? "N/A"}
- Date of Birth: ${profile.dateOfBirth ?? "N/A"}
- Goal: ${profile.goal ?? "N/A"}
- Activity level: ${profile.activityLevel ?? "N/A"}
- Height: ${profile.height ?? "N/A"}
- Weight: ${profile.weight ?? "N/A"}
- Allergies: ${profile.allergies ?? "None"}
- Equipment: ${profile.equipment ?? "None"}
- Days per week: ${profile.daysPerWeek ?? "N/A"}
- Minutes per session: ${profile.sessionMinutes ?? "N/A"}
- Notes: ${profile.notes ?? "N/A"}

Constraints:
- Keep the plan practical and safe.
- Avoid medical claims.
- End with a short safety disclaimer.`;
}

export async function POST(request: Request) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GROQ_API_KEY is not configured." },
      { status: 500 }
    );
  }

  let payload: PlanRequest;
  try {
    payload = (await request.json()) as PlanRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  if (!payload?.type || !payload.profile) {
    return NextResponse.json(
      { error: "Missing plan type or profile." },
      { status: 400 }
    );
  }

  const prompt = buildPrompt(payload);

  const response = await fetch(GROQ_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: "You are a helpful fitness planning assistant." },
        { role: "user", content: prompt },
      ],
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
      { error: "No plan returned from Groq." },
      { status: 500 }
    );
  }

  return NextResponse.json({ plan: content });
}
