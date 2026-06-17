"use client";

/**
 * Level2Game.tsx
 * 第二关：PK知识小达人游戏组件
 *
 * 功能：
 * - AB两组抢答
 * - 30道题随机抽10题（或上传Word题库替换）
 * - 每题15秒倒计时
 * - 答对绿色+加分，答错红色
 * - 开始/暂停/结束控制
 * - 支持上传Word题库（.docx）
 *
 * 使用方式：
 * 在 app/challenge/page.tsx 第二关部分：
 *   import Level2Game from "@/components/Level2Game";
 *   <Level2Game />
 *
 * 依赖：npm install mammoth
 *
 * Word题库格式约定（每题4行+1行答案）：
 * 题干文字
 * A. 选项一
 * B. 选项二
 * C. 选项三
 * D. 选项四
 * 正确答案：C. 选项三
 * （空行分隔下一题）
 */

import { useState, useEffect, useRef, useCallback } from "react";

// ── 题库（30道内置题）──
const BUILTIN_QUESTIONS = [
  { q: "正方体的表面积计算公式是棱长×棱长×几？", options: ["A. 4", "B. 5", "C. 6", "D. 8"], answer: "C. 6" },
  { q: "一个正方体棱长2cm，它的表面积是多少平方厘米？", options: ["A. 8", "B. 12", "C. 24", "D. 48"], answer: "C. 24" },
  { q: "一个正方体棱长4cm，它的表面积是多少平方厘米？", options: ["A. 16", "B. 48", "C. 96", "D. 64"], answer: "C. 96" },
  { q: "正方体每个面的形状是什么图形？", options: ["A. 长方形", "B. 正方形", "C. 三角形", "D. 梯形"], answer: "B. 正方形" },
  { q: "正方体棱长1cm，表面积是多少平方厘米？", options: ["A. 1", "B. 6", "C. 3", "D. 12"], answer: "B. 6" },
  { q: "一个正方体棱长5分米，它的表面积是多少平方分米？", options: ["A. 25", "B. 50", "C. 100", "D. 150"], answer: "D. 150" },
  { q: "正方体6个面的面积大小关系是？", options: ["A. 全部相等", "B. 上下相等", "C. 前后相等", "D. 都不相等"], answer: "A. 全部相等" },
  { q: "一个正方体棱长6m，它的表面积是多少平方米？", options: ["A. 36", "B. 72", "C. 144", "D. 216"], answer: "D. 216" },
  { q: "计算正方体表面积需要知道哪个条件？", options: ["A. 长", "B. 宽", "C. 棱长", "D. 高"], answer: "C. 棱长" },
  { q: "一个正方体棱长10cm，表面积是多少平方厘米？", options: ["A. 100", "B. 600", "C. 300", "D. 1000"], answer: "B. 600" },
  { q: "长方体表面积一共有几个面？", options: ["A. 4个", "B. 5个", "C. 6个", "D. 8个"], answer: "C. 6个" },
  { q: "长方体长3cm、宽2cm、高1cm，表面积是多少？", options: ["A. 11", "B. 22", "C. 6", "D. 12"], answer: "B. 22" },
  { q: "长方体长4cm、宽2cm、高3cm，表面积是多少？", options: ["A. 24", "B. 48", "C. 52", "D. 36"], answer: "C. 52" },
  { q: "长方体相对的面的面积关系是？", options: ["A. 全部不等", "B. 两两相等", "C. 全部相等", "D. 随机"], answer: "B. 两两相等" },
  { q: "长方体长5dm、宽2dm、高3dm，表面积是多少？", options: ["A. 62", "B. 31", "C. 30", "D. 10"], answer: "A. 62" },
  { q: "一个长方体长6cm、宽5cm、高2cm，表面积是多少？", options: ["A. 104", "B. 60", "C. 40", "D. 82"], answer: "A. 104" },
  { q: "不属于长方体表面积公式的是？", options: ["A. (长×宽+长×高+宽×高)×2", "B. 长×宽×6", "C. 上下+前后+左右面积和", "D. 所有面面积相加"], answer: "B. 长×宽×6" },
  { q: "长方体长10cm、宽1cm、高1cm，表面积是多少？", options: ["A. 22", "B. 42", "C. 10", "D. 12"], answer: "B. 42" },
  { q: "一个长方体长7cm、宽3cm、高2cm，表面积是多少？", options: ["A. 42", "B. 82", "C. 64", "D. 56"], answer: "B. 82" },
  { q: "长宽高都相等的长方体就是？", options: ["A. 长方形", "B. 正方体", "C. 圆柱体", "D. 梯形"], answer: "B. 正方体" },
  { q: "无盖鱼缸计算表面积，需要算几个面？", options: ["A. 3个", "B. 4个", "C. 5个", "D. 6个"], answer: "C. 5个" },
  { q: "做一个封闭纸箱，需要计算几个面的面积？", options: ["A. 4个", "B. 5个", "C. 6个", "D. 2个"], answer: "C. 6个" },
  { q: "正方体无盖收纳盒，计算表面积要算几个面？", options: ["A. 4个", "B. 5个", "C. 6个", "D. 3个"], answer: "B. 5个" },
  { q: "粉刷房间四周墙壁，不刷顶面和地面，一共算几个面？", options: ["A. 2个", "B. 4个", "C. 5个", "D. 6个"], answer: "B. 4个" },
  { q: "一个无盖正方体鱼缸棱长3dm，表面积是多少？", options: ["A. 27", "B. 45", "C. 54", "D. 18"], answer: "B. 45" },
  { q: "长方体通风管，一般不需要计算哪两个面？", options: ["A. 前后两面", "B. 左右两端面", "C. 上下两面", "D. 全部都算"], answer: "B. 左右两端面" },
  { q: "制作抽屉一般不需要计算哪个面？", options: ["A. 底面", "B. 前面", "C. 上面", "D. 侧面"], answer: "C. 上面" },
  { q: "棱长相等的两个正方体，它们的表面积？", options: ["A. 一定相等", "B. 一定不相等", "C. 不一定", "D. 无法比较"], answer: "A. 一定相等" },
  { q: "长方体紧贴地面摆放，被地面遮住几个面？", options: ["A. 1个", "B. 2个", "C. 3个", "D. 0个"], answer: "A. 1个" },
  { q: "计算长方体火柴盒外壳面积，通常算几个面？", options: ["A. 2个", "B. 4个", "C. 5个", "D. 6个"], answer: "B. 4个" },
];

const PK_NUM = 10;
const COUNTDOWN = 15;

type GameStatus = "idle" | "running" | "paused" | "finished";
type OptionState = "default" | "correct" | "wrong";

interface Question {
  q: string;
  options: string[];
  answer: string;
}

function getRandomQuestions(source: Question[], num: number): Question[] {
  const temp = [...source];
  const res: Question[] = [];
  for (let i = 0; i < num && temp.length > 0; i++) {
    const rnd = Math.floor(Math.random() * temp.length);
    res.push(temp.splice(rnd, 1)[0]);
  }
  return res;
}

/**
 * 解析Word文本为题目数组
 * 格式约定：
 * 题干
 * A. xxx
 * B. xxx
 * C. xxx
 * D. xxx
 * 正确答案：C. xxx
 */
function parseWordText(text: string): Question[] {
  const results: Question[] = [];
  // 按空行或连续换行分割题目块
  const blocks = text.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);

  for (const block of blocks) {
    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length < 6) continue; // 至少：题干+4选项+答案

    const q = lines[0];
    const options: string[] = [];
    let answer = "";

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (/^[A-D][.．]/.test(line)) {
        options.push(line);
      } else if (/正确答案[：:]/.test(line)) {
        answer = line.replace(/正确答案[：:]\s*/, "").trim();
      }
    }

    if (options.length === 4 && answer) {
      results.push({ q, options, answer });
    }
  }
  return results;
}

export default function Level2Game({
  onDone,
  onNextLevel,
}: {
  onDone?: (scoreA: number, scoreB: number) => void;
  onNextLevel?: () => void;
}) {
  const [status, setStatus] = useState<GameStatus>("idle");
  const [allQuestions, setAllQuestions] = useState<Question[]>(BUILTIN_QUESTIONS);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);
  const [timeLeft, setTimeLeft] = useState(COUNTDOWN);
  const [optionStatesA, setOptionStatesA] = useState<OptionState[]>([]);
  const [optionStatesB, setOptionStatesB] = useState<OptionState[]>([]);
  const [uploadMsg, setUploadMsg] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const statusRef = useRef<GameStatus>("idle");
  statusRef.current = status;
  const scoreARef = useRef(0);
  const scoreBRef = useRef(0);

  const currentQ = questions[currentIndex];

  const clearTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  const goNextQuestion = useCallback((nextIndex: number, qs: Question[]) => {
    if (nextIndex >= qs.length) { setStatus("finished"); clearTimer(); return; }
    setCurrentIndex(nextIndex);
    setTimeLeft(COUNTDOWN);
    setOptionStatesA(new Array(qs[nextIndex].options.length).fill("default"));
    setOptionStatesB(new Array(qs[nextIndex].options.length).fill("default"));
  }, [clearTimer]);

  const startCountdown = useCallback((qs: Question[], startIndex: number) => {
    clearTimer();
    let t = COUNTDOWN;
    timerRef.current = setInterval(() => {
      t--;
      setTimeLeft(t);
      if (t <= 0) {
        clearTimer();
        setTimeout(() => {
          if (statusRef.current === "running") {
            const next = startIndex + 1;
            goNextQuestion(next, qs);
            if (next < qs.length) startCountdown(qs, next);
          }
        }, 400);
      }
    }, 1000);
  }, [clearTimer, goNextQuestion]);

  const startGame = useCallback(() => {
    if (status === "paused") {
      setStatus("running");
      startCountdown(questions, currentIndex);
      return;
    }
    const qs = getRandomQuestions(allQuestions, Math.min(PK_NUM, allQuestions.length));
    setQuestions(qs);
    setCurrentIndex(0);
    setScoreA(0); setScoreB(0); scoreARef.current = 0; scoreBRef.current = 0;
    setTimeLeft(COUNTDOWN);
    setOptionStatesA(new Array(qs[0].options.length).fill("default"));
    setOptionStatesB(new Array(qs[0].options.length).fill("default"));
    setStatus("running");
    startCountdown(qs, 0);
  }, [status, questions, currentIndex, allQuestions, startCountdown]);

  const pauseGame = useCallback(() => {
    if (status !== "running") return;
    clearTimer(); setStatus("paused");
  }, [status, clearTimer]);

  const stopGame = useCallback(() => { clearTimer(); setStatus("finished"); }, [clearTimer]);

  const handleOption = useCallback((group: "A" | "B", optIndex: number) => {
    if (status !== "running" || !currentQ) return;
    const selected = currentQ.options[optIndex];
    const isCorrect = selected === currentQ.answer;

    if (group === "A") {
      setOptionStatesA((prev) => { const n = [...prev]; n[optIndex] = isCorrect ? "correct" : "wrong"; return n; });
      if (isCorrect) {
      setScoreA((s) => { const n = s + 1; scoreARef.current = n; return n; }); clearTimer();
        setTimeout(() => { if (statusRef.current === "running") { const next = currentIndex + 1; goNextQuestion(next, questions); if (next < questions.length) startCountdown(questions, next); } }, 600);
      }
    } else {
      setOptionStatesB((prev) => { const n = [...prev]; n[optIndex] = isCorrect ? "correct" : "wrong"; return n; });
      if (isCorrect) {
        setScoreB((s) => { const n = s + 1; scoreBRef.current = n; return n; }); clearTimer();
        setTimeout(() => { if (statusRef.current === "running") { const next = currentIndex + 1; goNextQuestion(next, questions); if (next < questions.length) startCountdown(questions, next); } }, 600);
      }
    }
  }, [status, currentQ, currentIndex, questions, clearTimer, goNextQuestion, startCountdown]);

  // 上传Word题库
  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".docx")) {
      setUploadMsg("❌ 请上传 .docx 格式的Word文件");
      return;
    }
    setUploading(true);
    setUploadMsg(null);
    try {
      const arrayBuffer = await file.arrayBuffer();
      // 动态加载mammoth，避免SSR报错
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ arrayBuffer });
      const parsed = parseWordText(result.value);
      if (parsed.length === 0) {
        setUploadMsg("❌ 未能解析到题目，请检查Word格式是否正确");
      } else {
        setAllQuestions(parsed);
        setUploadMsg(`✅ 成功导入 ${parsed.length} 道题目，点开始使用新题库`);
      }
    } catch {
      setUploadMsg("❌ 解析失败，请确认文件为 .docx 格式");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }, []);

  const resetToBuiltin = useCallback(() => {
    setAllQuestions(BUILTIN_QUESTIONS);
    setUploadMsg("已恢复内置题库（30道）");
  }, []);

  useEffect(() => () => clearTimer(), [clearTimer]);

  // Notify parent when game finishes
  useEffect(() => {
    if (status === "finished") onDone?.(scoreARef.current, scoreBRef.current);
  }, [status, onDone]);

  function optionClass(state: OptionState): string {
    if (state === "correct") return "bg-green-400 text-white border-green-500";
    if (state === "wrong") return "bg-red-400 text-white border-red-500";
    return "bg-white text-gray-700 border-gray-200 hover:bg-orange-50 hover:border-orange-300";
  }

  const timeColor = timeLeft <= 5 ? "text-red-500" : timeLeft <= 10 ? "text-orange-500" : "text-blue-600";
  const isCustomBank = allQuestions !== BUILTIN_QUESTIONS;

  return (
    <div className="space-y-4">
      {/* 标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="bg-yellow-100 text-yellow-600 text-xs font-bold px-3 py-1 rounded-full">⚡ 第二关</span>
          <span className="text-gray-500 text-sm">PK知识小达人</span>
        </div>
        {(status === "running" || status === "paused") && (
          <span className="text-gray-400 text-xs">{currentIndex + 1} / {questions.length}</span>
        )}
      </div>

      {/* 题库状态 + 上传按钮（仅idle/finished时显示）*/}
      {(status === "idle" || status === "finished") && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              当前题库：{isCustomBank ? `自定义（${allQuestions.length}题）` : `内置（${BUILTIN_QUESTIONS.length}题）`}
            </span>
            <div className="flex gap-2">
              {isCustomBank && (
                <button
                  onClick={resetToBuiltin}
                  className="text-xs text-gray-400 hover:text-gray-600 underline"
                >
                  恢复内置
                </button>
              )}
              <label className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-600 px-3 py-1 rounded-lg cursor-pointer transition-all">
                {uploading ? "解析中..." : "📄 上传Word题库"}
                <input
                  type="file"
                  accept=".docx"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
              </label>
            </div>
          </div>
          {uploadMsg && (
            <p className={`text-xs ${uploadMsg.startsWith("✅") ? "text-green-600" : "text-red-500"}`}>
              {uploadMsg}
            </p>
          )}
          <p className="text-xs text-gray-400">
            Word格式：题干 → A/B/C/D选项 → 正确答案：X. xxx（空行分隔每题）
          </p>
        </div>
      )}

      {/* 分数栏 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3 text-center">
          <p className="text-blue-600 text-xs font-medium mb-1">A组得分</p>
          <p className="text-3xl font-bold text-blue-600">{scoreA}</p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-3 text-center">
          <p className="text-orange-600 text-xs font-medium mb-1">B组得分</p>
          <p className="text-3xl font-bold text-orange-600">{scoreB}</p>
        </div>
      </div>

      {/* 待开始 */}
      {status === "idle" && (
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-center">
          <p className="text-4xl mb-3">⚡</p>
          <p className="text-gray-600 text-sm">AB两组抢答，随机{Math.min(PK_NUM, allQuestions.length)}道题，每题15秒！</p>
        </div>
      )}

      {/* 结束 */}
      {status === "finished" && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center space-y-2">
          <p className="text-3xl">🎉</p>
          <p className="text-green-700 font-bold text-lg">PK结束！</p>
          <p className="text-gray-600 text-sm">
            {scoreA > scoreB ? "🏆 A组获胜！" : scoreB > scoreA ? "🏆 B组获胜！" : "🤝 平局！势均力敌！"}
          </p>
          <p className="text-gray-400 text-xs">A组 {scoreA} 分 vs B组 {scoreB} 分</p>
        </div>
      )}

      {/* 游戏中 */}
      {(status === "running" || status === "paused") && currentQ && (
        <>
          <div className="flex justify-center">
            <div className={`text-5xl font-bold tabular-nums ${timeColor} transition-colors`}>{timeLeft}</div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 text-center">
            <p className="text-gray-800 font-medium text-base leading-relaxed">{currentQ.q}</p>
            {status === "paused" && <p className="text-yellow-600 text-xs mt-2 font-medium">⏸ 已暂停</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <p className="text-center text-blue-600 text-sm font-bold">A组选手</p>
              {currentQ.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleOption("A", i)}
                  disabled={status !== "running"}
                  className={`w-full px-3 py-2.5 rounded-xl text-sm border text-left transition-all ${optionClass(optionStatesA[i])} disabled:cursor-not-allowed`}
                >
                  {opt}
                </button>
              ))}
            </div>
            <div className="space-y-2">
              <p className="text-center text-orange-600 text-sm font-bold">B组选手</p>
              {currentQ.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleOption("B", i)}
                  disabled={status !== "running"}
                  className={`w-full px-3 py-2.5 rounded-xl text-sm border text-left transition-all ${optionClass(optionStatesB[i])} disabled:cursor-not-allowed`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* 控制按钮 */}
      <div className="flex gap-3">
        {(status === "idle" || status === "finished") && (
          <button onClick={startGame} className="flex-1 py-3 bg-yellow-400 hover:bg-yellow-500 text-white rounded-xl font-bold text-base transition-all active:scale-95">
            {status === "finished" ? "再来一轮 🔄" : "⚡ 开始PK！"}
          </button>
        )}
        {status === "finished" && onNextLevel && (
          <button onClick={onNextLevel} className="flex-1 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-bold text-base transition-all active:scale-95">
            进入第三关 →
          </button>
        )}
        {status === "running" && (
          <>
            <button onClick={pauseGame} className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-medium transition-all">⏸ 暂停</button>
            <button onClick={stopGame} className="flex-1 py-3 bg-red-100 hover:bg-red-200 text-red-600 rounded-xl font-medium transition-all">结束</button>
          </>
        )}
        {status === "paused" && (
          <>
            <button onClick={startGame} className="flex-1 py-3 bg-yellow-400 hover:bg-yellow-500 text-white rounded-xl font-bold transition-all">▶ 继续</button>
            <button onClick={stopGame} className="flex-1 py-3 bg-red-100 hover:bg-red-200 text-red-600 rounded-xl font-medium transition-all">结束</button>
          </>
        )}
      </div>
    </div>
  );
}
