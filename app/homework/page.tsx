"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { HOMEWORK_QUESTIONS } from "@/lib/questions";
import type { HomeworkQuestion } from "@/lib/questions";

type Level = "basic" | "medium" | "advanced";

const LEVEL_LABELS: Record<Level, string> = {
  basic: "基础巩固组",
  medium: "能力提升组",
  advanced: "拓展拔尖组",
};

const LEVEL_SCENES: Record<Level, string> = {
  basic: "homework_basic",
  medium: "homework_medium",
  advanced: "homework_advanced",
};

export default function HomeworkPage() {
  const router = useRouter();
  const [level, setLevel] = useState<Level | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [feedbacks, setFeedbacks] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [finished, setFinished] = useState(false);

  if (!level) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col items-center justify-center p-6">
        <img
          src="/fangfang.webp"
          alt="方方"
          className="w-20 h-20 rounded-xl shadow-md mb-4 object-cover"
        />
        <h2 className="text-2xl font-bold text-green-700 mb-2">课后辅导</h2>
        <p className="text-gray-500 text-sm mb-6">选择你的练习层级</p>
        <div className="w-full max-w-xs space-y-3">
          {(Object.entries(LEVEL_LABELS) as [Level, string][]).map(
            ([key, label]) => (
              <button
                key={key}
                onClick={() => setLevel(key)}
                className={`w-full py-4 rounded-2xl text-lg font-semibold shadow-md transition-all active:scale-95 ${
                  key === "basic"
                    ? "bg-blue-400 hover:bg-blue-500 text-white"
                    : key === "medium"
                      ? "bg-orange-400 hover:bg-orange-500 text-white"
                      : "bg-purple-400 hover:bg-purple-500 text-white"
                }`}
              >
                {key === "basic" ? "📘 " : key === "medium" ? "📙 " : "📕 "}
                {label}
                <span className="block text-sm font-normal opacity-80 mt-0.5">
                  {key === "basic"
                    ? "基础公式计算练习"
                    : key === "medium"
                      ? "变式应用与无盖/拼合"
                      : "逆向思维与综合挑战"}
                </span>
              </button>
            ),
          )}
        </div>
        <button
          onClick={() => router.push("/")}
          className="mt-6 text-gray-400 text-sm hover:text-gray-600"
        >
          返回首页
        </button>
      </main>
    );
  }

  const questions = HOMEWORK_QUESTIONS[level];
  const q = questions[currentQ];

  const handleSubmit = async () => {
    const answer = answers[q.id];
    if (!answer?.trim() || loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `学生正在做课后作业，题目：${q.question}。答案：${answer}。标准答案：${q.answer}（参考：${q.solution}）。请按辅导策略反馈。`,
          scene: LEVEL_SCENES[level],
        }),
      });
      const data = await res.json();
      setFeedbacks((f) => ({
        ...f,
        [q.id]: data.reply || "收到你的答案了！",
      }));
    } catch {
      setFeedbacks((f) => ({ ...f, [q.id]: "网络出了点问题，再试一次吧！" }));
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ((c) => c + 1);
    } else {
      setFinished(true);
    }
  };

  if (finished) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col items-center justify-center p-6">
        <img
          src="/fangfang.webp"
          alt="方方"
          className="w-20 h-20 rounded-xl shadow-md mb-4 object-cover"
        />
        <h2 className="text-2xl font-bold text-green-700 mb-2">作业完成！</h2>
        <p className="text-gray-500 mb-6">
          你完成了 {LEVEL_LABELS[level]} 的全部 {questions.length} 道题
        </p>
        <p className="text-gray-600 text-sm mb-6 text-center max-w-xs">
          今天你表现得很棒！
          <br />
          明天课堂上，我会继续陪着你一起探索数学的奥秘～
        </p>
        <button
          onClick={() => router.push("/")}
          className="px-6 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600"
        >
          返回首页
        </button>
      </main>
    );
  }

  const hasFeedback = !!feedbacks[q.id];

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col p-4">
      <div className="flex items-center gap-3 mb-4">
        <img
          src="/fangfang.webp"
          alt="方方"
          className="w-10 h-10 rounded-lg shadow-sm object-cover"
        />
        <div>
          <p className="text-sm font-medium text-green-700">课后辅导</p>
          <p className="text-xs text-gray-400">
            {LEVEL_LABELS[level]} · 第 {currentQ + 1} / {questions.length} 题
          </p>
        </div>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-1.5 mb-6">
        <div
          className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
        />
      </div>

      <div className="flex-1">
        <div className="bg-white rounded-2xl shadow-md p-5">
          <p className="text-gray-800 text-base leading-relaxed mb-4">{q.question}</p>
          <input
            value={answers[q.id] || ""}
            onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
            disabled={hasFeedback}
            placeholder="输入你的答案..."
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-400 disabled:bg-gray-50 disabled:text-gray-400"
            onKeyDown={(e) => e.key === "Enter" && !hasFeedback && handleSubmit()}
          />

          {!hasFeedback ? (
            <button
              onClick={handleSubmit}
              disabled={loading || !answers[q.id]?.trim()}
              className="mt-3 w-full py-3 bg-green-500 text-white rounded-xl font-medium disabled:opacity-40 hover:bg-green-600 transition-all"
            >
              {loading ? "方方在看..." : "提交答案"}
            </button>
          ) : (
            <div className="mt-3 bg-green-50 rounded-xl p-4 text-sm">
              <div className="flex gap-2 items-start">
                <img
                  src="/fangfang.webp"
                  alt="方方"
                  className="w-6 h-6 rounded-md flex-shrink-0 object-cover"
                />
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {feedbacks[q.id]}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3 mt-4 pb-4">
        <button
          onClick={() => currentQ > 0 && setCurrentQ((c) => c - 1)}
          disabled={currentQ === 0}
          className="px-5 py-3 bg-gray-100 text-gray-600 rounded-xl font-medium disabled:opacity-30 hover:bg-gray-200 transition-all"
        >
          上一题
        </button>
        <button
          onClick={handleNext}
          disabled={!hasFeedback}
          className="flex-1 py-3 bg-green-500 text-white rounded-xl font-medium disabled:opacity-40 hover:bg-green-600 transition-all"
        >
          {currentQ === questions.length - 1 ? "完成作业" : "下一题"}
        </button>
      </div>
    </main>
  );
}
