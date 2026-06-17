"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LEVEL1_QUESTION } from "@/lib/questions";
import Level2Game from "@/components/Level2Game";
import Level3Challenge from "@/components/Level3Challenge";
import PhotoUpload from "@/components/PhotoUpload";

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
  const [l1Method, setL1Method] = useState<0 | 1>(0);

  const [l2Done, setL2Done] = useState(false);
  const [l2Score, setL2Score] = useState(0);

  const [l3Passed, setL3Passed] = useState(false);

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

  const handleLevel2Done = (scoreA: number, scoreB: number) => {
    setL2Done(true);
    setL2Score(Math.max(scoreA, scoreB));
    setResult((r) => ({ ...r, level2Score: Math.max(scoreA, scoreB) }));
  };


  const finishAll = () => {
    const params = new URLSearchParams({
      l1: l1Passed ? "1" : "0",
      l2done: l2Done ? "1" : "0",
      l3: l3Passed ? "1" : "0",
    });
    router.push(`/reward?${params.toString()}`);
  };

  const levelTabs = [
    { key: "level1" as Level, label: "第一关", icon: "🪄", done: l1Passed },
    { key: "level2" as Level, label: "第二关", icon: "⚡", done: l2Done },
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
              <>
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
                <PhotoUpload
                  level="level1"
                  isSecondAttempt={l1Attempts > 1}
                  onLevel1Result={(isCorrect, reply) => {
                    setL1Reply(reply);
                    setL1Attempts((a) => a + 1);
                    if (isCorrect) {
                      setL1Passed(true);
                      setResult((r) => ({ ...r, level1Passed: true }));
                    }
                  }}
                  disabled={l1Passed}
                />
              </>
            )}
          </div>
        )}

        {/* ── 第二关 ── */}
        {level === "level2" && <Level2Game onDone={handleLevel2Done} onNextLevel={() => setLevel("level3")} />}

        {/* ── 第三关 ── */}
        {level === "level3" && (
          <div className="space-y-4">
            <Level3Challenge
              onPass={() => {
                setL3Passed(true);
                setResult((r) => ({ ...r, level3Passed: true }));
              }}
            />
            {/* 三关全部完成 */}
            {l3Passed && (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
                <p className="text-2xl mb-1">🏆</p>
                <p className="text-green-700 font-bold">三关全部完成！</p>
                <p className="text-gray-500 text-xs mt-1">
                  第一关：{l1Passed ? "✅" : "❌"}　第二关：✅　第三关：✅
                </p>
                <button
                  onClick={finishAll}
                  className="mt-3 px-6 py-2 bg-orange-400 text-white rounded-xl text-sm font-medium"
                >
                  查看我的成绩 →
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
