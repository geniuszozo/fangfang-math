"use client";

/**
 * Level3Challenge.tsx
 * 第三关：领奖台涂色题组件
 *
 * 使用方式：
 * 在 app/challenge/page.tsx 第三关部分替换原有内容：
 *   import Level3Challenge from "@/components/Level3Challenge";
 *   <Level3Challenge
 *     onPass={() => {
 *       setL3Passed(true);
 *       setResult((r) => ({ ...r, level3Passed: true }));
 *     }}
 *   />
 *
 * 依赖：components/PhotoUpload.tsx（已有）
 */

import { useState } from "react";
import PhotoUpload from "@/components/PhotoUpload";

interface Level3ChallengeProps {
  onPass: () => void;
}

export default function Level3Challenge({ onPass }: Level3ChallengeProps) {
  const [showGeoGebra, setShowGeoGebra] = useState(false);
  const [reply, setReply] = useState("");
  const [yellowPassed, setYellowPassed] = useState(false);
  const [redPassed, setRedPassed] = useState(false);
  const [yellowAttempts, setYellowAttempts] = useState(0);
  const [redAttempts, setRedAttempts] = useState(0);
  const [passed, setPassed] = useState(false);

  // 手动输入备用
  const [yellowInput, setYellowInput] = useState("");
  const [redInput, setRedInput] = useState("");
  const [manualLoading, setManualLoading] = useState(false);

  const handlePhotoResult = (result: {
    yellow: { found: boolean; isCorrect: boolean; extractedAnswer: string };
    red: { found: boolean; isCorrect: boolean; extractedAnswer: string };
    reply: string;
    allCorrect: boolean;
  }) => {
    setReply(result.reply);
    if (result.yellow.found) setYellowAttempts((a) => a + 1);
    if (result.red.found) setRedAttempts((a) => a + 1);
    if (result.yellow.isCorrect) setYellowPassed(true);
    if (result.red.isCorrect) setRedPassed(true);
    if (result.allCorrect) {
      setPassed(true);
      onPass();
    }
  };

  // 手动输入提交
  const handleManualSubmit = async () => {
    if ((!yellowInput && !yellowPassed) || (!redInput && !redPassed)) return;
    setManualLoading(true);
    try {
      // 黄色判断
      if (!yellowPassed && yellowInput) {
        const yellowNum = parseFloat(yellowInput.replace(/[^0-9.]/g, ""));
        const yellowCorrect = Math.abs(yellowNum - 12800) <= 1;
        if (yellowCorrect) setYellowPassed(true);
        setYellowAttempts((a) => a + 1);
      }
      // 红色判断
      if (!redPassed && redInput) {
        const redNum = parseFloat(redInput.replace(/[^0-9.]/g, ""));
        const redCorrect = Math.abs(redNum - 10000) <= 1;
        if (redCorrect) setRedPassed(true);
        setRedAttempts((a) => a + 1);
      }

      // 调用文字判题接口给出反馈
      const res = await fetch("/api/judge-level3", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          yellowAnswer: yellowInput,
          redAnswer: redInput,
          isSecondAttempt: yellowAttempts > 0 || redAttempts > 0,
        }),
      });
      const data = await res.json();
      setReply(data.reply);

      if (
        (yellowPassed || Math.abs(parseFloat(yellowInput.replace(/[^0-9.]/g, "")) - 12800) <= 1) &&
        (redPassed || Math.abs(parseFloat(redInput.replace(/[^0-9.]/g, "")) - 10000) <= 1)
      ) {
        setPassed(true);
        onPass();
      }
    } finally {
      setManualLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* 标题行 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="bg-purple-100 text-purple-600 text-xs font-bold px-3 py-1 rounded-full">
            🏆 第三关
          </span>
          <span className="text-gray-500 text-sm">领奖台涂色</span>
        </div>
        {/* 模型演示小按钮 */}
        <button
          onClick={() => setShowGeoGebra((v) => !v)}
          className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-500 border border-blue-200 px-3 py-1.5 rounded-lg transition-all"
        >
          {showGeoGebra ? "收起模型" : "📐 模型演示"}
        </button>
      </div>

      {/* GeoGebra嵌入（可展开/收起）*/}
      {showGeoGebra && (
        <div className="rounded-2xl overflow-hidden border border-blue-200">
          <iframe
            src="https://www.geogebra.org/classic/dkaaevhv"
            width="100%"
            height="360"
            style={{ border: "none" }}
            allowFullScreen
            title="领奖台涂色模型演示"
          />
        </div>
      )}

      {/* 题目卡片 */}
      <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
        <p className="text-gray-800 text-sm leading-relaxed font-medium">
          右面这个颁奖台是由3个长方体拼成的。它的前后两面涂黄色油漆，其他露出来的面涂红色油漆。涂黄色油漆和红色油漆的面积各是多少？（单位：cm）
        </p>
        {/* 尺寸说明 */}
        <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-600 space-y-1">
          <p>• 三个长方体底面均为 <strong>40×40 cm</strong></p>
          <p>• 1号台（最高）高 <strong>65 cm</strong></p>
          <p>• 2号台（中间）高 <strong>40 cm</strong>，台阶高 <strong>10 cm</strong></p>
          <p>• 3号台（最低）高 <strong>40 cm</strong></p>
        </div>
        {/* 答题状态指示 */}
        <div className="flex gap-2">
          <span className={`text-xs px-2 py-1 rounded-lg font-medium ${yellowPassed ? "bg-green-100 text-green-600" : "bg-yellow-50 text-yellow-600"}`}>
            {yellowPassed ? "✅ 黄色已答对" : "🟡 黄色面积待答"}
          </span>
          <span className={`text-xs px-2 py-1 rounded-lg font-medium ${redPassed ? "bg-green-100 text-green-600" : "bg-red-50 text-red-500"}`}>
            {redPassed ? "✅ 红色已答对" : "🔴 红色面积待答"}
          </span>
        </div>
      </div>

      {/* 方方反馈气泡 */}
      {reply && (
        <div className="flex gap-3">
          <div className="w-9 h-9 bg-blue-400 rounded-xl flex items-center justify-center flex-shrink-0 text-lg">
            😊
          </div>
          <div className="bg-white rounded-2xl px-4 py-3 text-sm text-gray-800 shadow-sm whitespace-pre-wrap flex-1 leading-relaxed">
            {reply}
          </div>
        </div>
      )}

      {/* 通关提示 */}
      {passed && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
          <p className="text-2xl mb-1">🏆</p>
          <p className="text-green-700 font-bold">第三关通过！两问全部答对！</p>
        </div>
      )}

      {/* 答题区（未通关时显示）*/}
      {!passed && (
        <div className="space-y-3">
          {/* 拍照上传 */}
          <PhotoUpload
            level="level3"
            yellowAttempts={yellowAttempts}
            redAttempts={redAttempts}
            onLevel3Result={handlePhotoResult}
            disabled={passed}
          />

          {/* 分隔线 */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400">或手动输入</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* 手动输入备用 */}
          <div className="space-y-2">
            {!yellowPassed && (
              <div className="flex gap-2 items-center">
                <span className="text-xs text-yellow-600 font-medium w-16 flex-shrink-0">🟡 黄色</span>
                <input
                  value={yellowInput}
                  onChange={(e) => setYellowInput(e.target.value)}
                  placeholder="输入黄色面积"
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-yellow-400"
                />
              </div>
            )}
            {!redPassed && (
              <div className="flex gap-2 items-center">
                <span className="text-xs text-red-500 font-medium w-16 flex-shrink-0">🔴 红色</span>
                <input
                  value={redInput}
                  onChange={(e) => setRedInput(e.target.value)}
                  placeholder="输入红色面积"
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-red-400"
                />
              </div>
            )}
            {(!yellowPassed || !redPassed) && (
              <button
                onClick={handleManualSubmit}
                disabled={manualLoading || (!yellowInput && !yellowPassed) || (!redInput && !redPassed)}
                className="w-full py-2.5 bg-purple-500 hover:bg-purple-600 disabled:opacity-40 text-white rounded-xl text-sm font-medium transition-all"
              >
                {manualLoading ? "判断中..." : "提交答案"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
