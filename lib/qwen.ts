// lib/qwen.ts
// 阿里云百炼 qwen-vl-max 图片识别封装

// ── 第一关返回结构 ──
export interface Level1JudgeResult {
  isCorrect: boolean;
  reply: string;
  extractedAnswer: string;
}

// ── 第三关返回结构（同时判断黄色和红色两问）──
export interface Level3JudgeResult {
  yellow: {
    found: boolean;        // 是否识别到答案
    isCorrect: boolean;
    extractedAnswer: string;
  };
  red: {
    found: boolean;
    isCorrect: boolean;
    extractedAnswer: string;
  };
  reply: string;           // 方方给学生的完整反馈
  allCorrect: boolean;     // 两问是否都对
}

// ── 第一关：衣柜题图片判题 ──
export async function judgeLevel1Photo(
  base64Image: string,
  mimeType: string,
  isSecondAttempt: boolean
): Promise<Level1JudgeResult> {

  const systemPrompt = `你是"方方"，一个活泼友善的数学虚拟学伴。
从学生上传的答题图片中识别出他们写的数字答案，判断是否正确。

【题目】衣柜长0.75m、宽0.5m、高1.6m，无底面，求需要布料面积
【正确答案】4.375m²
【误差范围】±0.01以内视为正确

【识别要求】
- 找出图片中学生写的最终答案数字
- 如果图片模糊看不清，用📷开头说明

【回复格式】
第一行必须是：ANSWER:识别到的数字（如 ANSWER:4.375，看不清写 ANSWER:unclear）
第二行起是给学生的反馈：
- 正确：✅开头，表扬+展示计算步骤（3步以内）
- 第一次错误：❌开头，提示"衣柜放在地板上，底面不需要罩布哦，只算5个面，再想想～"，不给答案
- 第二次错误：❌开头，给完整解析：前后两面0.75×1.6×2=2.4m²，左右两面0.5×1.6×2=1.6m²，顶面0.75×0.5=0.375m²，合计4.375m²
- 看不清：📷开头，请学生重新拍照

当前是否第二次作答：${isSecondAttempt}`;

  const fullReply = await callQwenVL(base64Image, mimeType, systemPrompt);

  const lines = fullReply.split('\n');
  const answerLine = lines.find((l: string) => l.startsWith('ANSWER:'));
  const extractedAnswer = answerLine ? answerLine.replace('ANSWER:', '').trim() : 'unclear';
  const reply = lines.filter((l: string) => !l.startsWith('ANSWER:')).join('\n').trim();

  const answerNum = parseFloat(extractedAnswer.replace(/[^0-9.]/g, ''));
  const isCorrect = !isNaN(answerNum) && Math.abs(answerNum - 4.375) <= 0.01;

  return { isCorrect, reply, extractedAnswer };
}

// ── 第三关：领奖台题图片判题（同时识别黄色和红色两问）──
export async function judgeLevel3Photo(
  base64Image: string,
  mimeType: string,
  yellowAttempts: number,  // 黄色已经答了几次
  redAttempts: number      // 红色已经答了几次
): Promise<Level3JudgeResult> {

  const systemPrompt = `你是"方方"，一个活泼友善的数学虚拟学伴。
学生上传了颁奖台涂色题的答题图片。这道题有两问，请同时识别两个答案。

【题目】颁奖台由3个长方体拼成，单位cm：
- 黄色：前后两面涂黄色油漆，正确答案 12800cm²
- 红色：其他露出来的面涂红色油漆，正确答案 10000cm²

【识别要求】
- 同时寻找图片中黄色和红色两问的答案
- 某一问找不到就标记为未找到
- 误差范围±1以内视为正确

【回复格式，严格按此输出】
YELLOW:识别到的数字（找不到写 YELLOW:notfound）
RED:识别到的数字（找不到写 RED:notfound）
FEEDBACK:
（这里写给学生的完整反馈，包含两问的判断结果）

【反馈规则】
黄色正确：✅黄色面积正确！
黄色第一次错误：❌黄色面积不对，提示：前后两面分三段计算，注意台阶高度差，再想想～
黄色第二次以上错误：❌黄色面积：40×40×2+40×65×2+40×(65-10)×2=3200+5200+4400=12800cm²
黄色未找到：📷图片里没找到黄色面积的答案，请补充写上或重新拍照

红色正确：✅红色面积正确！
红色第一次错误：❌红色面积不对，提示：红色是三个顶面加左右两侧面，再数数有哪些面～
红色第二次以上错误：❌红色面积：40×40×3+65×40×2=4800+5200=10000cm²
红色未找到：📷图片里没找到红色面积的答案，请补充写上或重新拍照

黄色已答次数：${yellowAttempts}（0=第一次，1=第一次错误后，2+=第二次以上）
红色已答次数：${redAttempts}`;

  const fullReply = await callQwenVL(base64Image, mimeType, systemPrompt);

  // 解析三行标记
  const lines = fullReply.split('\n');
  const yellowLine = lines.find((l: string) => l.startsWith('YELLOW:'));
  const redLine = lines.find((l: string) => l.startsWith('RED:'));
  const feedbackStart = lines.findIndex((l: string) => l.startsWith('FEEDBACK:'));

  const yellowRaw = yellowLine ? yellowLine.replace('YELLOW:', '').trim() : 'notfound';
  const redRaw = redLine ? redLine.replace('RED:', '').trim() : 'notfound';
  const reply = feedbackStart >= 0
    ? lines.slice(feedbackStart + 1).join('\n').trim()
    : lines.filter((l: string) => !l.startsWith('YELLOW:') && !l.startsWith('RED:') && !l.startsWith('FEEDBACK:')).join('\n').trim();

  const yellowFound = yellowRaw !== 'notfound' && yellowRaw !== 'unclear';
  const redFound = redRaw !== 'notfound' && redRaw !== 'unclear';

  const yellowNum = parseFloat(yellowRaw.replace(/[^0-9.]/g, ''));
  const redNum = parseFloat(redRaw.replace(/[^0-9.]/g, ''));

  const yellowCorrect = yellowFound && !isNaN(yellowNum) && Math.abs(yellowNum - 12800) <= 1;
  const redCorrect = redFound && !isNaN(redNum) && Math.abs(redNum - 10000) <= 1;

  return {
    yellow: {
      found: yellowFound,
      isCorrect: yellowCorrect,
      extractedAnswer: yellowRaw,
    },
    red: {
      found: redFound,
      isCorrect: redCorrect,
      extractedAnswer: redRaw,
    },
    reply,
    allCorrect: yellowCorrect && redCorrect,
  };
}

// ── 底层调用千问VL API ──
async function callQwenVL(
  base64Image: string,
  mimeType: string,
  systemPrompt: string
): Promise<string> {
  const response = await fetch(
    'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.QWEN_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'qwen-vl-max',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: { url: `data:${mimeType};base64,${base64Image}` },
              },
              {
                type: 'text',
                text: '请识别图片中的答案并判断。',
              },
            ],
          },
        ],
        max_tokens: 600,
        temperature: 0.1,
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`千问API错误 ${response.status}: ${err}`);
  }

  const data = await response.json();
  return data.choices[0].message.content ?? '';
}
