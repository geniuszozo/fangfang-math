"use client";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center justify-center p-6">
      <div className="text-center mb-10">
        <div className="w-28 h-28 mx-auto mb-4 bg-blue-400 rounded-3xl flex items-center justify-center shadow-lg">
          <img
            src="/fangfang.png"
            alt="方方"
            className="w-28 h-28 rounded-3xl object-cover"
          />
        </div>
        <h1 className="text-3xl font-bold text-blue-700">你好，我是方方！</h1>
        <p className="text-gray-400 text-sm mt-1">五年级数学虚拟学伴</p>
      </div>

      <div className="w-full max-w-xs space-y-4">
        <button
          onClick={() => router.push("/pre-test")}
          className="w-full py-4 bg-blue-400 hover:bg-blue-500 text-white rounded-2xl text-lg font-bold shadow transition-all active:scale-95"
        >
          📝 课前测验
          <span className="block text-sm font-normal opacity-80 mt-0.5">上课前在家完成</span>
        </button>
        <button
          onClick={() => router.push("/challenge")}
          className="w-full py-4 bg-orange-400 hover:bg-orange-500 text-white rounded-2xl text-lg font-bold shadow transition-all active:scale-95"
        >
          🎮 开始闯关
          <span className="block text-sm font-normal opacity-80 mt-0.5">课堂三关挑战</span>
        </button>
        <button
          onClick={() => router.push("/mindmap")}
          className="w-full py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl text-lg font-bold shadow transition-all active:scale-95"
        >
          🗺️ 知识总结
          <span className="block text-sm font-normal opacity-80 mt-0.5">本节课知识框架</span>
        </button>
        <button
          onClick={() => router.push("/homework")}
          className="w-full py-4 bg-green-500 hover:bg-green-600 text-white rounded-2xl text-lg font-bold shadow transition-all active:scale-95"
        >
          📚 课后辅导
          <span className="block text-sm font-normal opacity-80 mt-0.5">分层作业练习</span>
        </button>
      </div>
    </main>
  );
}
