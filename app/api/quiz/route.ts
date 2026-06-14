import { NextRequest, NextResponse } from "next/server";
import { PK_QUESTIONS } from "@/lib/questions";

export async function POST(req: NextRequest) {
  try {
    const { usedIds = [] } = await req.json();

    const available = PK_QUESTIONS.filter((q) => !usedIds.includes(q.id));

    if (available.length === 0) {
      return NextResponse.json({ finished: true });
    }

    const idx = Math.floor(Math.random() * available.length);
    const question = available[idx];

    return NextResponse.json({ question });
  } catch (error) {
    console.error("Quiz API error:", error);
    return NextResponse.json({ error: "出题服务暂时不可用" }, { status: 500 });
  }
}
