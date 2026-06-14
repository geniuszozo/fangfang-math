"use client";
import { useState, useRef, useCallback } from "react";

const MINDMAP_DATA = {
  center: "表面积",
  branches: [
    {
      title: "① 概念",
      color: "bg-blue-100 text-blue-700 border-blue-200",
      items: ["立体图形所有面面积的总和", '把立体图形"展开"成平面来理解'],
    },
    {
      title: "② 长方体公式",
      color: "bg-orange-100 text-orange-700 border-orange-200",
      items: ["S = (长×宽 + 长×高 + 宽×高) × 2", "三组不同的面，各算一次再×2"],
    },
    {
      title: "③ 正方体公式",
      color: "bg-green-100 text-green-700 border-green-200",
      items: ["S = 棱长 × 棱长 × 6", "六面完全相同，算一面×6"],
    },
    {
      title: "④ 变式应用",
      color: "bg-purple-100 text-purple-700 border-purple-200",
      items: ["无底面/无盖：减少对应面", "拼合图形：减去接触面（×2）", "关键：先判断要算几个面"],
    },
    {
      title: "⑤ 易错提醒",
      color: "bg-red-100 text-red-700 border-red-200",
      items: ["实际问题中看清楚哪些面不需要算", "单位统一再计算", "拼合时接触面要减去两个面"],
    },
  ],
};

export default function MindmapPage() {
  const [stage, setStage] = useState<"chat" | "show">("chat");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const startVoice = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;

    if (recognitionRef.current) recognitionRef.current.abort();

    const rec = new SR();
    rec.lang = "zh-CN";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    recognitionRef.current = rec;

    rec.onstart = () => setListening(true);
    rec.onresult = (e: SpeechRecognitionEvent) => {
      const text = (e.results[0]?.[0]?.transcript ?? "").trim();
      if (text) setInput((prev) => prev + text);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);

    rec.start();
  }, []);
  const [messages, setMessages] = useState<
    { role: "assistant" | "user"; content: string }[]
  >([
    {
      role: "assistant",
      content:
        "今天的数学探索要结束啦！在你离开之前，告诉我一件事——今天你最大的收获是什么？把它打进来，我来帮你整理一下！",
    },
  ]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const msg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: msg }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: msg,
          scene: "class_summary",
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      const reply = data.reply || "说得好！让我来帮你总结一下今天的知识框架吧～";
      const showMindmap = reply.length > 0;
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);

      if (showMindmap) {
        setTimeout(() => setStage("show"), 1500);
      }
    } catch {
      const fallback = "你真棒！让我来帮你总结一下今天的知识框架～";
      setMessages((prev) => [...prev, { role: "assistant", content: fallback }]);
      setTimeout(() => setStage("show"), 1500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Chat section */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}
          >
            {m.role === "assistant" && (
              <img
                src="/fangfang.png"
                alt="方方"
                className="w-10 h-10 rounded-xl flex-shrink-0 shadow-sm object-cover"
              />
            )}
            <div
              className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                m.role === "assistant"
                  ? "bg-white text-gray-800 shadow-sm"
                  : "bg-blue-500 text-white"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}

        {stage === "show" && (
          <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
            <div className="text-center mb-4">
              <div className="inline-block bg-blue-500 text-white text-lg font-bold px-6 py-2 rounded-2xl shadow">
                {MINDMAP_DATA.center}
              </div>
              <p className="text-gray-400 text-xs mt-1">
                《长方体和正方体的表面积》核心知识框架
              </p>
            </div>

            <div className="space-y-3">
              {MINDMAP_DATA.branches.map((branch, i) => (
                <div key={i} className={`border rounded-2xl p-4 ${branch.color}`}>
                  <h3 className="font-bold text-base mb-2">{branch.title}</h3>
                  <ul className="space-y-1">
                    {branch.items.map((item, j) => (
                      <li key={j} className="text-sm flex items-start gap-2">
                        <span className="mt-0.5 flex-shrink-0">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="text-center pt-2 flex items-center justify-center gap-2">
              <img
                src="/fangfang.png"
                alt="方方"
                className="w-6 h-6 rounded-md object-cover"
              />
              <p className="text-gray-400 text-xs">方方整理 · 记住这五点，表面积全拿下！</p>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex gap-3">
            <img
              src="/fangfang.png"
              alt="方方"
              className="w-10 h-10 rounded-xl shadow-sm object-cover"
            />
            <div className="bg-white px-4 py-3 rounded-2xl shadow-sm flex gap-1 items-center">
              <span className="w-2 h-2 bg-blue-300 rounded-full animate-bounce" />
              <span className="w-2 h-2 bg-blue-300 rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-2 h-2 bg-blue-300 rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      {stage === "chat" && (
        <div className="bg-white border-t p-4 space-y-3">
          <div className="flex gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder={listening ? "正在听你说话..." : "输入今天最大的收获..."}
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400"
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-40 text-white rounded-xl text-sm font-medium"
            >
              发送
            </button>
          </div>
          <button
            onClick={startVoice}
            disabled={listening}
            className={`w-full py-3 rounded-xl text-base font-medium flex items-center justify-center gap-2 transition-all ${
              listening
                ? "bg-red-100 text-red-500 animate-pulse"
                : "bg-gray-100 hover:bg-gray-200 text-gray-600"
            }`}
          >
            <span className="text-xl">🎤</span>
            <span>{listening ? "正在聆听..." : "语音输入"}</span>
          </button>
        </div>
      )}
    </div>
  );
}
