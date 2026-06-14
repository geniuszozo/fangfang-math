import { NextRequest, NextResponse } from "next/server";
import { chat } from "@/lib/deepseek";
import { SCENE_PROMPTS } from "@/lib/prompts";

export async function POST(req: NextRequest) {
  try {
    const { message, scene, history = [] } = await req.json();
    if (!message) {
      return NextResponse.json({ error: "message is required" }, { status: 400 });
    }

    const systemPrompt = SCENE_PROMPTS[scene] ?? "";
    if (!systemPrompt) {
      return NextResponse.json({ reply: "收到你的答案了！继续加油哦～" });
    }

    const messages = [
      { role: "system" as const, content: systemPrompt },
      ...history,
      { role: "user" as const, content: message },
    ];
    const reply = await chat(messages, 0.7);
    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json({ reply: "方方暂时断线了，再试一次吧！" });
  }
}
