import { NextResponse } from "next/server";

const crisis = /(自杀|自残|轻生|杀死|性侵|强奸|家暴|暴力威胁)/;

const names = ["林若", "沈知夏", "许安然", "顾清妍"];
const randomName = () => names[Math.floor(Math.random() * names.length)];

const classify = (text: string) => {
  if (/(裁员|失业|找工作|求职|工作|职业)/.test(text)) return { background: "她近期经历了职业节奏的变化。", dilemma: "职业变化与求职不确定带来的压力", goal: "重新建立职业方向与生活的稳定感", resources: ["过往工作经验", "职业关系", "重新行动的意愿"] };
  return { background: "她正处在人生方向发生变化的阶段。", dilemma: "现实压力与个人期待之间出现新的矛盾", goal: "在不确定中恢复选择能力", resources: ["已有经验", "支持网络", "行动能力"] };
};

export async function POST(request: Request) {
  const body = await request.json();
  const situation = String(body.situation || "").trim();
  if (crisis.test(situation)) return NextResponse.json({ safeMode: true }, { status: 422 });
  if (situation.length < 12 || situation.length > 500) return NextResponse.json({ error: "请用12—500字描述处境" }, { status: 400 });

  const userName = String(body.name || "").trim();
  const name = userName || randomName();
  const safe = classify(situation);

  return NextResponse.json({
    provider: "character-profile",
    aiGenerated: false,
    card: {
      name,
      portrait: Number(body.portrait || 0),
      ...safe,
      originalSituation: situation,
      instruction: "后续故事必须使用该主角名，并基于用户处境重新创作，不得使用示例故事。",
      preferences: body.preferences,
    },
  });
}
