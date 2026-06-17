"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { MEDALS } from "@/lib/questions";

function RewardContent() {
  const params = useSearchParams();
  const router = useRouter();

  const l1 = params.get("l1") === "1";
  const l2done = params.get("l2done") === "1";
  const l3 = params.get("l3") === "1";

  const passedCount = [l1, l2done, l3].filter(Boolean).length;
  const medal =
    passedCount === 3
      ? MEDALS.allCorrect
      : passedCount === 2
        ? MEDALS.twoPass
        : passedCount === 1
          ? MEDALS.onePass
          : MEDALS.keepGoing;

  const stars = Array.from({ length: 3 }, (_, i) => i < medal.stars);

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-white flex flex-col items-center justify-center p-6">
      <div className="text-center mb-8">
        <div className="text-7xl mb-4">{medal.icon}</div>
        <h1 className="text-2xl font-bold text-gray-800">{medal.title}</h1>
        <p className="text-gray-500 text-sm mt-2">{medal.desc}</p>
        <div className="flex justify-center gap-2 mt-4">
          {stars.map((filled, i) => (
            <span
              key={i}
              className={`text-3xl ${filled ? "text-yellow-400" : "text-gray-200"}`}
            >
              ★
            </span>
          ))}
        </div>
      </div>

      <div className="w-full max-w-xs bg-white rounded-2xl shadow-sm p-4 space-y-3 mb-8">
        <h2 className="text-sm font-bold text-gray-600 mb-2">闯关详情</h2>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">🪄 第一关·衣柜换新衣</span>
          <span className={`text-sm font-bold ${l1 ? "text-green-500" : "text-red-400"}`}>
            {l1 ? "已通过" : "未通过"}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">⚡ 第二关·PK知识达人</span>
          <span className={`text-sm font-bold ${l2done ? "text-green-500" : "text-red-400"}`}>
            {l2done ? "已通过" : "未通过"}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">🏆 第三关·领奖台涂色</span>
          <span className={`text-sm font-bold ${l3 ? "text-green-500" : "text-red-400"}`}>
            {l3 ? "已通过" : "未通过"}
          </span>
        </div>
      </div>

      <div className="w-full max-w-xs space-y-3">
        <button
          onClick={() => router.push("/mindmap")}
          className="w-full py-3 bg-blue-500 text-white rounded-xl font-medium"
        >
          🗺️ 查看知识总结
        </button>
        <button
          onClick={() => router.push("/")}
          className="w-full py-3 bg-gray-100 text-gray-600 rounded-xl font-medium"
        >
          返回首页
        </button>
      </div>
    </div>
  );
}

export default function RewardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-gray-400">
          加载中...
        </div>
      }
    >
      <RewardContent />
    </Suspense>
  );
}
