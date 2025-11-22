import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { INITIAL_NODES } from "@/data/landscape";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");

  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "Missing OPENAI_API_KEY environment variable" },
      { status: 500 },
    );
  }

  const existingNames = INITIAL_NODES
    .filter((n) => n.type === "node")
    .map((n: any) => n.label)
    .join(", ");

  const userPrompt = `
You maintain a knowledge base of machine-learning interatomic potentials (MLIPs).

Existing models: ${existingNames}.

Return at most 3 NEW models discovered in the last 12 months that are NOT in the list.
For each model, produce JSON with fields:
  - id (short machine-safe id, lowercase, no spaces)
  - label
  - year
  - author
  - category ("Equivariant" | "Invariant" | "Transformer" | "Descriptor")
  - desc (1-2 sentences)
  - githubUrl (optional string)
  - paperUrl (optional string)

Wrap everything in an object: { "newModels": [ ... ] } and output ONLY valid JSON (no markdown, no commentary).
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5.1-mini",
      messages: [
        {
          role: "system",
          content: "You are a precise assistant that only outputs strict JSON when asked.",
        },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      max_tokens: 800,
    });

    const text = completion.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(text) as { newModels?: any[] };

    return NextResponse.json({
      newModels: parsed.newModels ?? [],
    });
  } catch (error: any) {
    console.error("update-landscape error", error);
    return NextResponse.json(
      {
        error: "Failed to fetch MLIP updates",
        details: error?.message ?? "Unknown error",
      },
      { status: 500 },
    );
  }
}
