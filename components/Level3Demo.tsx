"use client";

import { useState } from "react";

type Stage = 0 | 1 | 2 | 3;

const CX = 170, CY = 230, S = 52;

function iso(x: number, y: number, z: number): [number, number] {
  return [CX + (x - y) * S * 0.866, CY - z * S - (x + y) * S * 0.5];
}

function pt(x: number, y: number, z: number): string {
  return iso(x, y, z).join(",");
}

function IsoLine({
  x1, y1, z1, x2, y2, z2,
  color = "#333", dash = false, strokeWidth = 1.5,
}: {
  x1: number; y1: number; z1: number;
  x2: number; y2: number; z2: number;
  color?: string; dash?: boolean; strokeWidth?: number;
}) {
  const [ax, ay] = iso(x1, y1, z1);
  const [bx, by] = iso(x2, y2, z2);
  return (
    <line x1={ax} y1={ay} x2={bx} y2={by}
      stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
      strokeDasharray={dash ? "6 4" : undefined} />
  );
}

function IsoPoly({
  verts, fill = "none", fillOpacity, stroke = "none", strokeWidth = 1.5,
}: {
  verts: [number, number, number][];
  fill?: string; fillOpacity?: number;
  stroke?: string; strokeWidth?: number;
}) {
  return (
    <polygon points={verts.map(([x, y, z]) => pt(x, y, z)).join(" ")}
      fill={fill} fillOpacity={fillOpacity}
      stroke={stroke} strokeWidth={strokeWidth} strokeLinejoin="round" />
  );
}

function IsoTxt({ x, y, z, text, color = "#555", fontSize = 12 }: {
  x: number; y: number; z: number; text: string; color?: string; fontSize?: number;
}) {
  const [px, py] = iso(x, y, z);
  return (
    <text x={px} y={py} textAnchor="middle" fontSize={fontSize}
      fill={color} fontWeight="500" fontFamily="system-ui, sans-serif">{text}</text>
  );
}

function WireCube({ ox, oy, oz, s, solidColor = "#333", dashColor = "#bbb" }: {
  ox: number; oy: number; oz: number; s: number;
  solidColor?: string; dashColor?: string;
}) {
  return (
    <>
      <IsoLine x1={ox} y1={oy+s} z1={oz}   x2={ox+s} y2={oy+s} z2={oz}   color={dashColor} dash />
      <IsoLine x1={ox} y1={oy}   z1={oz}   x2={ox}   y2={oy+s} z2={oz}   color={dashColor} dash />
      <IsoLine x1={ox} y1={oy+s} z1={oz}   x2={ox}   y2={oy+s} z2={oz+s} color={dashColor} dash />
      <IsoLine x1={ox} y1={oy}   z1={oz}   x2={ox+s} y2={oy}   z2={oz}   color={solidColor} />
      <IsoLine x1={ox+s} y1={oy} z1={oz}   x2={ox+s} y2={oy+s} z2={oz}   color={solidColor} />
      <IsoLine x1={ox} y1={oy}   z1={oz}   x2={ox}   y2={oy}   z2={oz+s} color={solidColor} />
      <IsoLine x1={ox+s} y1={oy} z1={oz}   x2={ox+s} y2={oy}   z2={oz+s} color={solidColor} />
      <IsoLine x1={ox+s} y1={oy+s} z1={oz} x2={ox+s} y2={oy+s} z2={oz+s} color={solidColor} />
      <IsoLine x1={ox} y1={oy}   z1={oz+s} x2={ox+s} y2={oy}   z2={oz+s} color={solidColor} />
      <IsoLine x1={ox+s} y1={oy} z1={oz+s} x2={ox+s} y2={oy+s} z2={oz+s} color={solidColor} />
      <IsoLine x1={ox} y1={oy}   z1={oz+s} x2={ox}   y2={oy+s} z2={oz+s} color={solidColor} />
      <IsoLine x1={ox} y1={oy+s} z1={oz+s} x2={ox+s} y2={oy+s} z2={oz+s} color={solidColor} />
    </>
  );
}

function DropArrow() {
  const [ax, ay] = iso(0, 0, 2.1);
  return (
    <>
      <IsoLine x1={0} y1={0} z1={3.55} x2={0} y2={0} z2={2.2} color="#aaa" dash strokeWidth={1.2} />
      <polygon points={`${ax},${ay} ${ax-4},${ay-8} ${ax+4},${ay-8}`} fill="#aaa" stroke="none" />
    </>
  );
}

export default function Level3Demo() {
  const [stage, setStage] = useState<Stage>(0);
  const B = { ox: -1, oy: -1, oz: 0, s: 2 };
  const T = { ox: -0.5, oy: -0.5, oz: 2, s: 1 };

  const descriptions: Record<Stage, string> = {
    0: "两个正方体分开放：底层棱长 <strong>2m</strong>，顶层棱长 <strong>1m</strong>。点击下一步观察叠放后的变化。",
    1: "顶层居中落在底层上方。两者接触的地方（顶层底面 + 底层被盖住的部分）<strong>都不涂色</strong>。",
    2: "<strong style='color:#EA580C'>橙色区域</strong>：顶层底面盖住了底层顶面正中央 1×1=<strong>1m²</strong>，这一块<strong>两个面都不涂色</strong>。<br/>底层顶面其余露出部分：2×2−1×1=<strong>3m²</strong>，要涂色。",
    3: "<strong style='color:#EA580C'>橙色</strong> = 遮挡区域（不涂色）。底层顶面露出 3m²，加上四个侧面和顶层各面，合计 <strong>24m²</strong>。",
  };

  const btnLabels: Partial<Record<Stage, string>> = {
    0: "下一步：叠放 →",
    1: "下一步：标出遮挡区域 →",
    2: "查看分步计算 →",
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-blue-500 text-sm font-bold">🎬 动态演示</span>
        <span className="text-gray-400 text-xs">观察两个正方体叠放后的遮挡关系</span>
      </div>

      <div className="flex justify-center">
        <svg width="340" height="320" viewBox="0 0 340 320" xmlns="http://www.w3.org/2000/svg">
          {stage === 0 && (
            <>
              <WireCube {...B} />
              <WireCube ox={T.ox} oy={T.oy} oz={3.6} s={T.s} />
              <IsoTxt x={0} y={-2} z={4.3} text="顶层（1m）" color="#555" fontSize={12} />
              <IsoTxt x={-1} y={-2.3} z={1} text="底层（2m）" color="#555" fontSize={12} />
              <DropArrow />
            </>
          )}
          {stage === 1 && (
            <>
              <WireCube {...B} />
              <WireCube ox={T.ox} oy={T.oy} oz={T.oz} s={T.s} />
              <IsoTxt x={0} y={-1.8} z={2.85} text="顶层（1m）" color="#555" fontSize={12} />
              <IsoTxt x={-1} y={-2.3} z={1} text="底层（2m）" color="#555" fontSize={12} />
            </>
          )}
          {(stage === 2 || stage === 3) && (
            <>
              <WireCube {...B} />
              <IsoPoly verts={[[T.ox,T.oy,T.oz],[T.ox+T.s,T.oy,T.oz],[T.ox+T.s,T.oy+T.s,T.oz],[T.ox,T.oy+T.s,T.oz]]}
                fill="#F97316" fillOpacity={0.85} stroke="#EA580C" strokeWidth={1.5} />
              <WireCube ox={T.ox} oy={T.oy} oz={T.oz} s={T.s} />
              <IsoTxt x={0} y={0} z={T.oz+0.45} text="遮挡区域" color="#EA580C" fontSize={11} />
              <IsoTxt x={0} y={0} z={T.oz-0.3} text="1×1=1m²" color="#EA580C" fontSize={11} />
            </>
          )}
        </svg>
      </div>

      <div className="bg-white rounded-xl px-4 py-3 text-sm text-gray-700 leading-relaxed min-h-[52px]"
        dangerouslySetInnerHTML={{ __html: descriptions[stage] }} />

      {stage === 3 && (
        <div className="bg-white rounded-xl p-4 text-sm border border-orange-200">
          <p className="font-bold text-orange-600 mb-3">📐 涂色面积分层计算</p>
          <p className="text-blue-600 font-medium text-xs mb-1">底层（棱长 2m）</p>
          <p className="text-gray-600 mb-0.5">四个侧面 2×2×4 <span className="inline-block w-8" /> = <span className="font-medium text-gray-800">16m²</span></p>
          <p className="text-gray-600 mb-0.5">顶面露出 2×2−1×1 <span className="inline-block w-12" /> = <span className="font-medium text-gray-800">3m²</span></p>
          <p className="text-gray-500 border-t border-gray-100 pt-1">底层小计 <span className="inline-block w-20" /> = <span className="font-medium text-blue-600">19m²</span></p>
          <p className="text-green-600 font-medium text-xs mb-1 mt-3">顶层（棱长 1m）</p>
          <p className="text-gray-600 mb-0.5">四个侧面 1×1×4 <span className="inline-block w-8" /> = <span className="font-medium text-gray-800">4m²</span></p>
          <p className="text-gray-600 mb-0.5">顶面 1×1 <span className="inline-block w-20" /> = <span className="font-medium text-gray-800">1m²</span></p>
          <p className="text-gray-500 border-t border-gray-100 pt-1">顶层小计 <span className="inline-block w-20" /> = <span className="font-medium text-green-600">5m²</span></p>
          <p className="font-bold border-t-2 border-gray-200 pt-2 mt-1">
            总涂色面积 <span className="inline-block w-12" /> = <span className="text-purple-600">24m²</span>
          </p>
        </div>
      )}

      <div className="flex gap-3">
        {stage < 3 && (
          <button onClick={() => setStage((s) => (s + 1) as Stage)}
            className="flex-1 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-medium transition-all active:scale-95">
            {btnLabels[stage]}
          </button>
        )}
        <button onClick={() => setStage(0)}
          className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-xl text-sm transition-all">
          重置
        </button>
      </div>
    </div>
  );
}
