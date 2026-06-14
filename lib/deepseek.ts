import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com",
});

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function chat(
  messages: ChatMessage[],
  temperature = 0.7,
): Promise<string> {
  const response = await client.chat.completions.create({
    model: "deepseek-chat",
    messages,
    temperature,
    max_tokens: 500,
  });
  return response.choices[0].message.content ?? "";
}
