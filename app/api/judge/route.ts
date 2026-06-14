import { NextRequest, NextResponse } from "next/server";
import { chat } from "@/lib/deepseek";
import { JUDGE_LEVEL1_PROMPT } from "@/lib/prompts";
import { LEVEL1_QUESTION } from "@/lib/questions";

export async function POST(req: NextRequest) {
  try {
    const { studentAnswer, isSecondAttempt = false } = await req.json();
    const answerNum = parseFloat(String(studentAnswer).replace(/[^0-9.]/g, ""));
    const isCorrect = !isNaN(answerNum) && Math.abs(answerNum - LEVEL1_QUESTION.correctAnswer) < 0.01;

    const reply = await chat(
      [
        { role: "system", content: JUDGE_LEVEL1_PROMPT },
        {
          role: "user",
          content: `学生答案: ${studentAnswer}\n是否第二次作答: ${isSecondAttempt}`,
        },
      ],
      0.1,
    );

    return NextResponse.json({ reply, isCorrect });
  } catch {
    return NextResponse.json({ error: "判题服务暂时不可用" }, { status: 500 });
  }
}
