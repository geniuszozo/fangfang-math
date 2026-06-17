"use client";

/**
 * PhotoUpload.tsx
 * 拍照上传答题组件，第一关和第三关共用
 *
 * 第一关用法：
 * <PhotoUpload
 *   level="level1"
 *   isSecondAttempt={l1Attempts > 1}
 *   onLevel1Result={(isCorrect, reply) => { ... }}
 *   disabled={l1Passed}
 * />
 *
 * 第三关用法：
 * <PhotoUpload
 *   level="level3"
 *   yellowAttempts={yellowAttempts}
 *   redAttempts={redAttempts}
 *   onLevel3Result={(result) => { ... }}
 *   disabled={l3AllPassed}
 * />
 */

import { useState, useRef } from "react";

type Level = "level1" | "level3";

interface Level3Result {
  yellow: { found: boolean; isCorrect: boolean; extractedAnswer: string };
  red: { found: boolean; isCorrect: boolean; extractedAnswer: string };
  reply: string;
  allCorrect: boolean;
}

interface PhotoUploadProps {
  level: Level;
  disabled?: boolean;
  // 第一关
  isSecondAttempt?: boolean;
  onLevel1Result?: (isCorrect: boolean, reply: string) => void;
  // 第三关
  yellowAttempts?: number;
  redAttempts?: number;
  onLevel3Result?: (result: Level3Result) => void;
}

export default function PhotoUpload({
  level,
  disabled = false,
  isSecondAttempt = false,
  onLevel1Result,
  yellowAttempts = 0,
  redAttempts = 0,
  onLevel3Result,
}: PhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("请上传图片文件");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("图片太大，请压缩后重试（5MB以内）");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      // 读取base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // 预览
      setPreview(URL.createObjectURL(file));

      // 构造请求体
      const body: Record<string, unknown> = {
        imageBase64: base64,
        mimeType: file.type,
        level,
      };

      if (level === "level1") {
        body.isSecondAttempt = isSecondAttempt;
      } else {
        body.yellowAttempts = yellowAttempts;
        body.redAttempts = redAttempts;
      }

      const res = await fetch("/api/judge-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (level === "level1" && onLevel1Result) {
        onLevel1Result(data.isCorrect ?? false, data.reply ?? "识别出错，请重试");
      } else if (level === "level3" && onLevel3Result) {
        onLevel3Result(data as Level3Result);
      }

    } catch {
      setError("上传失败，请检查网络后重试");
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      {/* 预览 */}
      {preview && (
        <div className="relative">
          <img
            src={preview}
            alt="答题图片"
            className="w-full max-h-44 object-contain rounded-xl border border-gray-200 bg-gray-50"
          />
          {loading && (
            <div className="absolute inset-0 bg-white/75 rounded-xl flex flex-col items-center justify-center gap-2">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
              <p className="text-xs text-blue-500 font-medium">方方正在识别答案...</p>
            </div>
          )}
        </div>
      )}

      {/* 错误提示 */}
      {error && <p className="text-red-500 text-xs">{error}</p>}

      {/* 第三关提示语 */}
      {level === "level3" && !preview && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-3 py-2 text-xs text-yellow-700">
          💡 可以把黄色和红色两问写在同一张纸上一起拍，方方会同时识别两个答案！
        </div>
      )}

      {/* 上传按钮 */}
      <label
        className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-medium border-2 border-dashed transition-all
          ${disabled || loading
            ? "border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50"
            : "border-blue-300 text-blue-500 hover:bg-blue-50 cursor-pointer active:scale-95"
          }`}
      >
        {loading ? (
          <span className="text-blue-400">识别中...</span>
        ) : (
          <>📷 {preview ? "重新拍照" : "拍照上传答题过程"}</>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileChange}
          disabled={disabled || loading}
        />
      </label>

      <p className="text-gray-400 text-xs text-center">
        拍下计算过程，方方来判断～
      </p>
    </div>
  );
}
