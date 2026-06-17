"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Q {
  id: number;
  type: "fill" | "choice" | "judge";
  question: string;
  answer: string[];
  options?: string[];
  flexible?: string[][];
}

const QUESTIONS: Q[] = [
  {
    id: 1,
    type: "fill",
    question: "长方体有（　）个面，相对的面（　）。",
    answer: ["6", "相同"],
    flexible: [["6"], ["相同", "相等", "一样"]],
  },
  {
    id: 2,
    type: "fill",
    question: "正方体的6个面都是（　），且每个面的面积（　）。",
    answer: ["正方形", "相等"],
    flexible: [["正方形"], ["相等", "相同", "一样"]],
  },
  {
    id: 3,
    type: "fill",
    question: "一个长方形，长8cm，宽5cm，面积是（　）cm²。",
    answer: ["40"],
    flexible: [["40"]],
  },
  {
    id: 4,
    type: "choice",
    question: "下列说法正确的是？",
    options: [
      "A. 长方体的6个面都相同",
      "B. 长方体相对的两个面形状和大小相同",
      "C. 正方体不是特殊的长方体",
      "D. 长方体只有4个面",
    ],
    answer: ["B"],
  },
  {
    id: 5,
    type: "judge",
    question: "正方体是特殊的长方体，因为它的长、宽、高都相等。",
    answer: ["true"],
  },
];

export default function PreTestPage() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [finished, setFinished] = useState(false);
  const [results, setResults] = useState<{ q: Q; correct: boolean; userAnswer: string }[]>([]);

  const checkAnswer = (q: Q, userAnswer: string): boolean => {
    if (q.type === "fill" && q.flexible) {
      const parts = userAnswer.split(",").map((s) => s.trim().toLowerCase());
      return q.flexible.every((accepted, idx) =>
        accepted.some((a) => a.toLowerCase() === (parts[idx] || "")),
      );
    }
    if (q.type === "choice")
      return userAnswer.toUpperCase() === q.answer[0].toUpperCase();
    if (q.type === "judge")
      return userAnswer === q.answer[0];
    return false;
  };

  const handleNext = () => {
    if (current < QUESTIONS.length - 1) {
      setCurrent((c) => c + 1);
    } else {
      const res = QUESTIONS.map((q) => ({
        q,
        userAnswer: answers[q.id] || "",
        correct: checkAnswer(q, answers[q.id] || ""),
      }));
      const score = res.filter((r) => r.correct).length;
      const level = score >= 4 ? "advanced" : score >= 2 ? "medium" : "basic";
      localStorage.setItem("fangfang_level", level);
      setResults(res);
      setFinished(true);
    }
  };

  const handlePrev = () => {
    if (current > 0) setCurrent((c) => c - 1);
  };

  if (finished) {
    const score = results.filter((r) => r.correct).length;
    const level = score >= 4 ? "advanced" : score >= 2 ? "medium" : "basic";
    const labels: Record<string, string> = {
      basic: "基础巩固组",
      medium: "能力提升组",
      advanced: "拓展拔尖组",
    };
    const guides: Record<string, string> = {
      basic:
        "今天的课程我们会从最基础的知识开始，一步一步来！老师会带着大家重新认识长方体和正方体的每个面，你只要跟着节奏，认真听讲，一定没问题～",
      medium:
        "你已经掌握了大部分基础知识！今天的课堂上，重点关注变式应用题——比如无盖纸盒、通风管道，看清楚哪些面不需要算，你就能更上一层楼！",
      advanced:
        "太棒了，你对已有知识掌握得非常扎实！今天课堂上你可以挑战拔尖题：逆向思维、立体拼合……准备好迎接更难的挑战了吗？",
    };
    return (
      <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center p-6 pb-12">
        <img
          src="/fangfang.webp"
          alt="方方"
          className="w-16 h-16 rounded-xl shadow-md mb-3 object-cover"
        />
        <h2 className="text-xl font-bold text-blue-700 mb-1">测验完成！</h2>
        <p className="text-gray-500 text-sm mb-4">
          答对 <span className="font-bold text-blue-600">{score}</span> / {QUESTIONS.length} 题
        </p>

        {/* 引导语 */}
        <div className="w-full max-w-md bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-4">
          <div className="flex gap-2 items-start">
            <img src="/fangfang.webp" alt="方方" className="w-6 h-6 rounded-md flex-shrink-0 object-cover" />
            <p className="text-sm text-gray-700 leading-relaxed">{guides[level]}</p>
          </div>
        </div>

        <div className="w-full max-w-md space-y-2 mb-6">
          {results.map((r) => {
            const qNum = r.q.id;
            const correctAns = r.q.answer.join("、");
            return (
              <div
                key={qNum}
                className={`rounded-xl p-3 text-sm flex items-start gap-2 ${
                  r.correct ? "bg-green-50 border border-green-100" : "bg-red-50 border border-red-100"
                }`}
              >
                <span className="flex-shrink-0 mt-0.5">{r.correct ? "✅" : "❌"}</span>
                <div className="flex-1">
                  <p className="text-gray-700 leading-relaxed">
                    {qNum}. {r.q.question}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    你的答案：<span className={r.correct ? "text-green-600 font-medium" : "text-red-500 font-medium"}>{r.userAnswer || "（未作答）"}</span>
                    {!r.correct && (
                      <span className="text-gray-400"> · 参考答案：{correctAns}</span>
                    )}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => router.push("/")}
          className="px-6 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600"
        >
          返回首页
        </button>
      </main>
    );
  }

  const q = QUESTIONS[current];

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col p-4">
      <div className="flex items-center gap-3 mb-4">
        <img
          src="/fangfang.webp"
          alt="方方"
          className="w-10 h-10 rounded-lg shadow-sm object-cover"
        />
        <div>
          <p className="text-sm font-medium text-blue-700">课前测验</p>
          <p className="text-xs text-gray-400">
            第 {current + 1} / {QUESTIONS.length} 题
          </p>
        </div>
        <div className="ml-auto text-xs text-gray-400">
          {q.type === "fill" ? "填空" : q.type === "choice" ? "选择" : "判断"}
        </div>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-1.5 mb-6">
        <div
          className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${((current + 1) / QUESTIONS.length) * 100}%` }}
        />
      </div>

      <div className="flex-1">
        <div className="bg-white rounded-2xl shadow-md p-5">
          <p className="text-gray-800 text-base leading-relaxed mb-4">{q.question}</p>

          {q.type === "fill" && (
            <div className="space-y-3">
              {q.answer.map((_, idx) => {
                const parts = (answers[q.id] || "").split(",");
                return (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">空 {idx + 1}：</span>
                    <input
                      value={parts[idx] || ""}
                      onChange={(e) => {
                        const p = [...parts];
                        p[idx] = e.target.value;
                        setAnswers((a) => ({ ...a, [q.id]: p.join(",") }));
                      }}
                      className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400"
                      placeholder="输入答案"
                    />
                  </div>
                );
              })}
            </div>
          )}

          {q.type === "choice" && (
            <div className="space-y-2">
              {q.options!.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setAnswers((a) => ({ ...a, [q.id]: opt.charAt(0) }))}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                    answers[q.id] === opt.charAt(0)
                      ? "border-blue-400 bg-blue-50 text-blue-700"
                      : "border-gray-200 text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}

          {q.type === "judge" && (
            <div className="flex gap-3">
              <button
                onClick={() => setAnswers((a) => ({ ...a, [q.id]: "true" }))}
                className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                  answers[q.id] === "true"
                    ? "bg-green-100 border-green-400 border text-green-700"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                ✅ 正确
              </button>
              <button
                onClick={() => setAnswers((a) => ({ ...a, [q.id]: "false" }))}
                className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                  answers[q.id] === "false"
                    ? "bg-red-100 border-red-400 border text-red-700"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                ❌ 错误
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3 mt-4 pb-4">
        <button
          onClick={handlePrev}
          disabled={current === 0}
          className="px-5 py-3 bg-gray-100 text-gray-600 rounded-xl font-medium disabled:opacity-30 hover:bg-gray-200"
        >
          上一题
        </button>
        <button
          onClick={handleNext}
          disabled={!answers[q.id]}
          className="flex-1 py-3 bg-blue-500 text-white rounded-xl font-medium disabled:opacity-40 hover:bg-blue-600"
        >
          {current === QUESTIONS.length - 1 ? "完成测验" : "下一题"}
        </button>
      </div>
    </main>
  );
}
