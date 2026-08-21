import { NextResponse } from "next/server";

const crisis = /(自杀|自残|轻生|杀死|性侵|强奸|家暴|暴力威胁)/;
const classify = (text: string) => {
  if (/(裁员|失业|找工作|求职|工作|职业)/.test(text)) return { background: "她近期经历了职业节奏的变化。", dilemma: "职业变化与求职不确定带来的压力", goal: "重新建立职业方向与生活的稳定感", resources: ["过往工作经验", "曾经建立的职业关系", "愿意重新行动"] };
  if (/(结婚|恋爱|男友|伴侣|感情|分手)/.test(text)) return { background: "她正在重新理解一段重要关系。", dilemma: "亲密关系中的期待、边界与长期选择", goal: "在关系与自我之间找到更诚实的位置", resources: ["对关系的投入", "表达感受的能力", "可以求助的朋友"] };
  if (/(父母|孩子|生育|家庭|照顾)/.test(text)) return { background: "她的个人计划与家庭责任发生了交叠。", dilemma: "家庭责任、个人节奏与现实资源之间的取舍", goal: "建立可持续且不失去自我的安排", resources: ["家庭关系", "已有生活经验", "协调资源的能力"] };
  return { background: "她正处在人生方向发生变化的阶段。", dilemma: "现实压力与个人期待之间出现了新的矛盾", goal: "在不确定中恢复选择与行动的能力", resources: ["已有生活经验", "重新选择的意愿", "可能获得的支持"] };
};

export async function POST(request: Request) {
  const body = await request.json(); const situation = String(body.situation || "").trim();
  if (crisis.test(situation)) return NextResponse.json({ safeMode: true, message: "你描述的情况可能涉及现实安全风险。请优先联系可信赖的人、当地紧急服务或专业支持；这里暂不把它改编成游戏故事。" }, { status: 422 });
  if (situation.length < 12 || situation.length > 500) return NextResponse.json({ error: "请用12—500字描述处境" }, { status: 400 });
  const safe = classify(situation);
  const clamp = (value: unknown, fallback: number) => Math.min(5, Math.max(1, Number(value) || fallback));
  const storyPreferences = {
    difficulty: clamp(body.preferences?.difficulty, 3),
    conflict: clamp(body.preferences?.conflict, 3),
    drama: clamp(body.preferences?.drama, 2),
    realism: clamp(body.preferences?.realism, 4),
  };
  const promptConstraints = [
    `选择难度 ${storyPreferences.difficulty}/5：选项应体现相应程度的现实代价，但不设置明显正确答案。`,
    `冲突强度 ${storyPreferences.conflict}/5：冲突必须来自人物目标、关系边界和有限资源。`,
    `戏剧程度 ${storyPreferences.drama}/5：允许相应数量的转折，但禁止依赖巧合、猎奇或强行反转。`,
    `现实质感 ${storyPreferences.realism}/5：职业、经济、关系与时间成本必须符合真实生活逻辑。`,
  ];
  // The original text intentionally goes out of scope after this request and is never logged.
  return NextResponse.json({ card: { name: String(body.name || "若岚").slice(0, 12), portrait: Number(body.portrait || 0), ...safe, storyPreferences, promptConstraints } });
}
