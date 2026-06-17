// app/api/judge-photo/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { judgeLevel1Photo, judgeLevel3Photo } from '@/lib/qwen';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageBase64, mimeType, level } = body;

    if (!imageBase64 || !level) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }

    if (level === 'level1') {
      // 第一关：单问判题
      const { isSecondAttempt = false } = body;
      const result = await judgeLevel1Photo(imageBase64, mimeType || 'image/jpeg', isSecondAttempt);
      return NextResponse.json(result);

    } else if (level === 'level3') {
      // 第三关：同时判断黄色和红色两问
      const { yellowAttempts = 0, redAttempts = 0 } = body;
      const result = await judgeLevel3Photo(imageBase64, mimeType || 'image/jpeg', yellowAttempts, redAttempts);
      return NextResponse.json(result);

    } else {
      return NextResponse.json({ error: '未知关卡' }, { status: 400 });
    }

  } catch (error) {
    console.error('图片判题错误:', error);
    return NextResponse.json(
      {
        error: '图片识别暂时不可用',
        reply: '📷 图片识别暂时出了点问题，你可以直接在下方输入框里填写答案哦！',
      },
      { status: 500 }
    );
  }
}
