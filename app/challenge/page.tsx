"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LEVEL1_QUESTION, LEVEL3_QUESTION, PK_QUESTIONS } from "@/lib/questions";
import type { PKQuestion } from "@/lib/questions";
import Level3Demo from "@/components/Level3Demo";

type Level = "level1" | "level2" | "level3" | "done";

type GameResult = {
  level1Passed: boolean;
  level1Attempts: number;
  level2Score: number;
  level3Passed: boolean;
  level3Attempts: number;
};

export default function ChallengePage() {
  const router = useRouter();
  const [level, setLevel] = useState<Level>("level1");
  const [result, setResult] = useState<GameResult>({
    level1Passed: false,
    level1Attempts: 0,
    level2Score: 0,
    level3Passed: false,
    level3Attempts: 0,
  });

  const [l1Input, setL1Input] = useState("");
  const [l1Reply, setL1Reply] = useState("");
  const [l1Attempts, setL1Attempts] = useState(0);
  const [l1Passed, setL1Passed] = useState(false);
  const [l1Loading, setL1Loading] = useState(false);

  const [pkUsedIds, setPkUsedIds] = useState<number[]>([]);
  const [pkQuestion, setPkQuestion] = useState<PKQuestion | null>(null);
  const [pkShowAnswer, setPkShowAnswer] = useState(false);
  const [pkScore, setPkScore] = useState(0);
  const [pkFinished, setPkFinished] = useState(false);
  const [pkLoading, setPkLoading] = useState(false);

  const [l3Input, setL3Input] = useState("");
  const [l3Reply, setL3Reply] = useState("");
  const [l3Attempts, setL3Attempts] = useState(0);
  const [l3Passed, setL3Passed] = useState(false);
  const [l3Loading, setL3Loading] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [l1Method, setL1Method] = useState<0 | 1>(0);

  const submitLevel1 = async () => {
    if (!l1Input.trim() || l1Loading) return;
    setL1Loading(true);
    const attempts = l1Attempts + 1;
    setL1Attempts(attempts);
    try {
      const res = await fetch("/api/judge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentAnswer: l1Input, isSecondAttempt: attempts > 1 }),
      });
      const data = await res.json();
      setL1Reply(data.reply || "收到你的答案了！");
      if (data.isCorrect) {
        setL1Passed(true);
        setResult((r) => ({ ...r, level1Passed: true, level1Attempts: attempts }));
      }
    } catch {
      setL1Reply("网络不太好，再试一次吧！");
    } finally {
      setL1Loading(false);
    }
  };

  const fetchPkQuestion = async () => {
    setPkShowAnswer(false);
    setPkLoading(true);
    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usedIds: pkUsedIds }),
      });
      const data = await res.json();
      if (data.finished) {
        setPkFinished(true);
        setResult((r) => ({ ...r, level2Score: pkScore }));
      } else {
        setPkQuestion(data.question);
        setPkUsedIds((prev) => [...prev, data.question.id]);
      }
    } catch {
      // ignore
    } finally {
      setPkLoading(false);
    }
  };

  const revealPkAnswer = () => {
    setPkShowAnswer(true);
    setPkScore((s) => s + 1);
  };

  const submitLevel3 = async () => {
    if (!l3Input.trim() || l3Loading) return;
    setL3Loading(true);
    const attempts = l3Attempts + 1;
    setL3Attempts(attempts);
    try {
      const res = await fetch("/api/judge-level3", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentAnswer: l3Input, isSecondAttempt: attempts > 1 }),
      });
      const data = await res.json();
      setL3Reply(data.reply || "收到你的答案了！");
      if (data.isCorrect) {
        setL3Passed(true);
        setResult((r) => ({ ...r, level3Passed: true, level3Attempts: attempts }));
      }
    } catch {
      setL3Reply("网络不太好，再试一次吧！");
    } finally {
      setL3Loading(false);
    }
  };

  const finishAll = () => {
    const params = new URLSearchParams({
      l1: result.level1Passed || l1Passed ? "1" : "0",
      l1a: String(result.level1Attempts || l1Attempts),
      l2: String(pkScore),
      l3: result.level3Passed || l3Passed ? "1" : "0",
      l3a: String(result.level3Attempts || l3Attempts),
    });
    router.push(`/reward?${params.toString()}`);
  };

  const levelTabs = [
    { key: "level1" as Level, label: "第一关", icon: "🪄", done: l1Passed },
    { key: "level2" as Level, label: "第二关", icon: "⚡", done: pkFinished },
    { key: "level3" as Level, label: "第三关", icon: "🏆", done: l3Passed },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex flex-col">
      <div className="bg-orange-400 text-white px-4 py-4 text-center">
        <h1 className="text-xl font-bold">🎮 方方闯关挑战</h1>
        <p className="text-sm opacity-80 mt-0.5">长方体和正方体的表面积</p>
      </div>

      <div className="flex border-b bg-white">
        {levelTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setLevel(tab.key)}
            className={`flex-1 py-3 text-sm font-medium transition-all ${
              level === tab.key
                ? "text-orange-500 border-b-2 border-orange-400"
                : "text-gray-400"
            }`}
          >
            {tab.icon} {tab.label}
            {tab.done && <span className="ml-1 text-green-500">✓</span>}
          </button>
        ))}
      </div>

      <div className="p-4 space-y-4 flex-1">
        {/* ── 第一关 ── */}
        {level === "level1" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-orange-100 text-orange-600 text-xs font-bold px-3 py-1 rounded-full">
                  🪄 第一关
                </span>
                <span className="text-gray-500 text-sm">衣柜换新衣</span>
              </div>
              <p className="text-gray-800 text-sm leading-relaxed">
                {LEVEL1_QUESTION.description}
              </p>
              <div className="mt-3 flex items-start gap-3">
                <img
                  src="/level1-illustration.png"
                  alt="衣柜示意图"
                  className="w-1/5 rounded-xl border border-gray-100"
                />
                <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-md">衣柜示意图</span>
              </div>
            </div>

            {l1Reply && (
              <>
                <div className="flex gap-3">
                  <img src="/fangfang.png" alt="方方"
                    className="w-9 h-9 rounded-xl flex-shrink-0 object-cover shadow-sm" />
                  <div className="bg-white rounded-2xl px-4 py-3 text-sm text-gray-800 shadow-sm whitespace-pre-wrap flex-1">
                    {l1Reply}
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 shadow-sm border border-orange-100">
                  <p className="text-sm text-gray-600 mb-3">
                    💡 这道题有不同的解决方法，一起来看看吧！
                  </p>
                  <div className="flex gap-2 mb-3">
                    <button
                      onClick={() => setL1Method(0)}
                      className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                        l1Method === 0
                          ? "bg-orange-400 text-white"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      方法一：分面计算
                    </button>
                    <button
                      onClick={() => setL1Method(1)}
                      className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                        l1Method === 1
                          ? "bg-orange-400 text-white"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      方法二：整体减底面
                    </button>
                  </div>

                  {l1Method === 0 ? (
                    <div className="bg-orange-50 rounded-xl p-3 text-sm space-y-1.5 text-gray-700">
                      <p className="font-medium text-orange-600 mb-2">📐 分面计算法</p>
                      <p>思路：衣柜只有5个面需要罩布（底面除外），逐个计算再相加。</p>
                      <div className="bg-white rounded-lg p-3 mt-2 space-y-1">
                        <p>① 前后两面：0.75 × 1.6 × 2 = <span className="font-semibold">2.4m²</span></p>
                        <p>② 左右两面：0.5 × 1.6 × 2 = <span className="font-semibold">1.6m²</span></p>
                        <p>③ 顶面：0.75 × 0.5 = <span className="font-semibold">0.375m²</span></p>
                        <div className="border-t border-orange-100 pt-1 mt-1">
                          <p>✅ 合计：2.4 + 1.6 + 0.375 = <span className="font-bold text-orange-600">4.375m²</span></p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-blue-50 rounded-xl p-3 text-sm space-y-1.5 text-gray-700">
                      <p className="font-medium text-blue-600 mb-2">📐 整体减底面法</p>
                      <p>思路：先算6个面的总面积，再减去不需要的底面。</p>
                      <div className="bg-white rounded-lg p-3 mt-2 space-y-1">
                        <p>① 6个面总面积：</p>
                        <p className="pl-3">(0.75×0.5 + 0.75×1.6 + 0.5×1.6) × 2</p>
                        <p className="pl-3">= (0.375 + 1.2 + 0.8) × 2</p>
                        <p className="pl-3">= 2.375 × 2 = <span className="font-semibold">4.75m²</span></p>
                        <p>② 底面面积：0.75 × 0.5 = <span className="font-semibold">0.375m²</span></p>
                        <div className="border-t border-blue-100 pt-1 mt-1">
                          <p>✅ 需要布料：4.75 − 0.375 = <span className="font-bold text-blue-600">4.375m²</span></p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {l1Passed && (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
                <p className="text-2xl mb-1">🎉</p>
                <p className="text-green-700 font-bold">第一关通过！</p>
                <button
                  onClick={() => setLevel("level2")}
                  className="mt-3 px-6 py-2 bg-orange-400 text-white rounded-xl text-sm font-medium"
                >
                  进入第二关 →
                </button>
              </div>
            )}

            {!l1Passed && (
              <div className="flex gap-3">
                <input
                  value={l1Input}
                  onChange={(e) => setL1Input(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submitLevel1()}
                  placeholder="输入你的答案"
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400"
                />
                <button
                  onClick={submitLevel1}
                  disabled={l1Loading || !l1Input.trim()}
                  className="px-5 py-2.5 bg-orange-400 hover:bg-orange-500 disabled:opacity-40 text-white rounded-xl text-sm font-medium"
                >
                  {l1Loading ? "..." : "提交"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── 第二关 ── */}
        {level === "level2" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="bg-yellow-100 text-yellow-600 text-xs font-bold px-3 py-1 rounded-full">
                  ⚡ 第二关
                </span>
                <span className="text-orange-500 font-bold text-sm">积分：{pkScore} 分</span>
              </div>
              <p className="text-gray-500 text-sm mt-2">PK知识小达人 · 共3题随机抢答</p>
            </div>

            {!pkQuestion && !pkFinished && (
              <button
                onClick={fetchPkQuestion}
                disabled={pkLoading}
                className="w-full py-5 bg-yellow-400 hover:bg-yellow-500 text-white rounded-2xl text-lg font-bold shadow transition-all"
              >
                {pkLoading ? "出题中..." : "⚡ 开始出题！"}
              </button>
            )}

            {pkQuestion && !pkFinished && (
              <div className="space-y-3">
                <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs bg-yellow-200 text-yellow-700 px-2 py-0.5 rounded-full">
                      {pkQuestion.category}
                    </span>
                    <span className="text-xs text-gray-400">第 {pkUsedIds.length} 题 / 共3题</span>
                  </div>
                  <p className="text-gray-800 font-medium text-base leading-relaxed">
                    {pkQuestion.question}
                  </p>
                </div>

                {pkShowAnswer && (
                  <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
                    <p className="text-green-700 font-bold">✅ {pkQuestion.answer}</p>
                    <p className="text-gray-600 text-sm mt-1">{pkQuestion.solution}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  {!pkShowAnswer && (
                    <button
                      onClick={revealPkAnswer}
                      className="flex-1 py-3 bg-green-500 text-white rounded-xl font-medium"
                    >
                      公布答案 +1分
                    </button>
                  )}
                  {pkUsedIds.length < 3 ? (
                    <button
                      onClick={fetchPkQuestion}
                      disabled={pkLoading}
                      className="flex-1 py-3 bg-yellow-400 text-white rounded-xl font-medium"
                    >
                      {pkLoading ? "..." : "下一题 →"}
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setPkFinished(true);
                        setResult((r) => ({ ...r, level2Score: pkScore }));
                      }}
                      className="flex-1 py-3 bg-orange-400 text-white rounded-xl font-medium"
                    >
                      完成PK ✓
                    </button>
                  )}
                </div>
              </div>
            )}

            {pkFinished && (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
                <p className="text-2xl mb-1">⚡</p>
                <p className="text-green-700 font-bold">第二关完成！得了 {pkScore} 分</p>
                <button
                  onClick={() => setLevel("level3")}
                  className="mt-3 px-6 py-2 bg-orange-400 text-white rounded-xl text-sm font-medium"
                >
                  进入第三关 →
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── 第三关 ── */}
        {level === "level3" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-purple-100 text-purple-600 text-xs font-bold px-3 py-1 rounded-full">
                  🏆 第三关
                </span>
                <span className="text-gray-500 text-sm">领奖台涂色</span>
              </div>
              <p className="text-gray-800 text-sm leading-relaxed">
                {LEVEL3_QUESTION.description}
              </p>
              <p className="text-blue-500 text-xs mt-2 cursor-pointer hover:text-blue-600 underline" onClick={() => setShowDemo(!showDemo)}>
                💡 {LEVEL3_QUESTION.geogebraHint}
              </p>
            </div>

            {showDemo && <Level3Demo />}

            {l3Reply && (
              <div className="flex gap-3">
                <img
                  src="/fangfang.png"
                  alt="方方"
                  className="w-9 h-9 rounded-xl flex-shrink-0 object-cover shadow-sm"
                />
                <div className="bg-white rounded-2xl px-4 py-3 text-sm text-gray-800 shadow-sm whitespace-pre-wrap flex-1">
                  {l3Reply}
                </div>
              </div>
            )}

            {l3Passed && (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
                <p className="text-2xl mb-1">🏆</p>
                <p className="text-green-700 font-bold">第三关通过！三关全部完成！</p>
                <button
                  onClick={finishAll}
                  className="mt-3 px-6 py-2 bg-orange-400 text-white rounded-xl text-sm font-medium"
                >
                  查看我的成绩 →
                </button>
              </div>
            )}

            {!l3Passed && (
              <div className="flex gap-3">
                <input
                  value={l3Input}
                  onChange={(e) => setL3Input(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submitLevel3()}
                  placeholder="输入你的答案"
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-purple-400"
                />
                <button
                  onClick={submitLevel3}
                  disabled={l3Loading || !l3Input.trim()}
                  className="px-5 py-2.5 bg-purple-500 hover:bg-purple-600 disabled:opacity-40 text-white rounded-xl text-sm font-medium"
                >
                  {l3Loading ? "..." : "提交"}
                </button>
              </div>
            )}

            {!l3Passed && (
              <button
                onClick={finishAll}
                className="w-full py-2 text-gray-400 text-xs underline"
              >
                跳过，直接查看成绩
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
