// app/api/judge-level3/route.ts
// 第三关文字输入判题接口（手动输入备用方案）

import { NextRequest, NextResponse } from "next/server";
import { chat } from "@/lib/deepseek";
import { JUDGE_LEVEL3_PROMPT } from "@/lib/prompts";

export async function POST(req: NextRequest) {
  try {
    const { yellowAnswer, redAnswer, isSecondAttempt = false } = await req.json();

    const yellowNum = parseFloat(String(yellowAnswer).replace(/[^0-9.]/g, ""));
    const redNum = parseFloat(String(redAnswer).replace(/[^0-9.]/g, ""));

    const yellowCorrect = !isNaN(yellowNum) && Math.abs(yellowNum - 12800) <= 1;
    const redCorrect = !isNaN(redNum) && Math.abs(redNum - 10000) <= 1;

    const userMessage = `
学生提交：
黄色面积答案：${yellowAnswer}（系统判断：${yellowCorrect ? "正确" : "错误"}）
红色面积答案：${redAnswer}（系统判断：${redCorrect ? "正确" : "错误"}）
是否第二次作答：${isSecondAttempt}
请分别对两问给出反馈。
    `;

    const reply = await chat(
      [
        { role: "system", content: JUDGE_LEVEL3_PROMPT },
        { role: "user", content: userMessage },
      ],
      0.1
    );

    return NextResponse.json({ reply, yellowCorrect, redCorrect });
  } catch {
    return NextResponse.json({ error: "判题服务暂时不可用" }, { status: 500 });
  }
}
