"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Q {
  id: number;
  type: "fill" | "choice" | "judge";
  question: string;
  answer: string[] | string | boolean;
  options?: string[];
  hint?: string;
}

const QUESTIONS: Q[] = [
  {
    id: 1,
    type: "fill",
    question: "长方体有（　）个面，相对的面（　）。",
    answer: ["6", "相同"],
  },
  {
    id: 2,
    type: "fill",
    question: "正方体的6个面都是（　），且每个面的面积（　）。",
    answer: ["正方形", "相等"],
  },
  {
    id: 3,
    type: "fill",
    question: "一个长方形，长8cm，宽5cm，面积是（　）cm²。",
    answer: ["40"],
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
    answer: "B",
  },
  {
    id: 5,
    type: "judge",
    question: "正方体是特殊的长方体，因为它的长、宽、高都相等。",
    answer: true,
  },
];

export default function PreTestPage() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState(0);

  const q = QUESTIONS[current];

  const checkAnswer = (q: Q, userAnswer: string): boolean => {
    if (q.type === "fill") {
      const parts = userAnswer.split(",").map((s) => s.trim());
      return (q.answer as string[]).every((a, i) => parts[i] === a);
    }
    if (q.type === "choice") return userAnswer.toUpperCase() === (q.answer as string).toUpperCase();
    if (q.type === "judge") return userAnswer === String(q.answer);
    return false;
  };

  const handleNext = () => {
    if (current < QUESTIONS.length - 1) {
      setCurrent((c) => c + 1);
    } else {
      let s = 0;
      for (const q of QUESTIONS) {
        const ans = answers[q.id] || "";
        if (checkAnswer(q, ans)) s++;
      }
      setScore(s);
      const level = s >= 4 ? "advanced" : s >= 2 ? "medium" : "basic";
      localStorage.setItem("fangfang_level", level);
      setFinished(true);
    }
  };

  const handlePrev = () => { if (current > 0) setCurrent((c) => c - 1); };

  if (finished) {
    const level = score >= 4 ? "advanced" : score >= 2 ? "medium" : "basic";
    const labels: Record<string, string> = {
      basic: "基础巩固组",
      medium: "能力提升组",
      advanced: "拓展拔尖组",
    };
    return (
      <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center justify-center p-6">
        <img src="/fangfang.png" alt="方方" className="w-20 h-20 rounded-xl shadow-md mb-4 object-cover" />
        <h2 className="text-2xl font-bold text-blue-700 mb-2">测验完成！</h2>
        <p className="text-gray-500 mb-4">5 题中答对 <span className="font-bold text-blue-600">{score}</span> 题</p>
        <p className="text-gray-500 text-sm mb-6">你属于 <span className="font-bold text-blue-600">{labels[level]}</span></p>
        <button onClick={() => router.push("/")} className="px-6 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600">
          返回首页
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col p-4">
      <div className="flex items-center gap-3 mb-4">
        <img src="/fangfang.png" alt="方方" className="w-10 h-10 rounded-lg shadow-sm object-cover" />
        <div>
          <p className="text-sm font-medium text-blue-700">课前测验</p>
          <p className="text-xs text-gray-400">第 {current + 1} / {QUESTIONS.length} 题</p>
        </div>
        <div className="ml-auto text-xs text-gray-400">
          {q.type === "fill" ? "填空" : q.type === "choice" ? "选择" : "判断"}
        </div>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-1.5 mb-6">
        <div className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${((current + 1) / QUESTIONS.length) * 100}%` }} />
      </div>

      <div className="flex-1">
        <div className="bg-white rounded-2xl shadow-md p-5">
          <p className="text-gray-800 text-base leading-relaxed mb-4">{q.question}</p>

          {q.type === "fill" && (
            <div className="space-y-3">
              {(q.answer as string[]).map((_, idx) => {
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
                <button key={opt}
                  onClick={() => setAnswers((a) => ({ ...a, [q.id]: opt.charAt(0) }))}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                    answers[q.id] === opt.charAt(0)
                      ? "border-blue-400 bg-blue-50 text-blue-700"
                      : "border-gray-200 text-gray-700 hover:border-gray-300"
                  }`}>
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
                  answers[q.id] === "true" ? "bg-green-100 border-green-400 border text-green-700" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}>✅ 正确</button>
              <button
                onClick={() => setAnswers((a) => ({ ...a, [q.id]: "false" }))}
                className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                  answers[q.id] === "false" ? "bg-red-100 border-red-400 border text-red-700" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}>❌ 错误</button>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3 mt-4 pb-4">
        <button onClick={handlePrev} disabled={current === 0}
          className="px-5 py-3 bg-gray-100 text-gray-600 rounded-xl font-medium disabled:opacity-30 hover:bg-gray-200">上一题</button>
        <button onClick={handleNext} disabled={!answers[q.id]}
          className="flex-1 py-3 bg-blue-500 text-white rounded-xl font-medium disabled:opacity-40 hover:bg-blue-600">
          {current === QUESTIONS.length - 1 ? "完成测验" : "下一题"}
        </button>
      </div>
    </main>
  );
}
