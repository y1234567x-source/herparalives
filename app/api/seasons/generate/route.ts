import { NextResponse } from "next/server";
import { getPreset } from "@/server/story-library";
import type { CharacterCard, StoryPreferences } from "@/lib/types";
import { STORY_EDITOR_PROMPT_VERSION } from "@/server/story-editor-prompt";

export async function POST(request: Request) {
  const body = await request.json() as { character?: CharacterCard; preferences?: StoryPreferences };
  const character = body.character;
  if (!character) return NextResponse.json({ error: "缺少角色卡" }, { status: 400 });
  const base = getPreset("test-story");
  if (!base) return NextResponse.json({ error: "安全故事模板不可用" }, { status: 503 });
  const story = base.nodes.map((node, index) => ({
    ...node,
    id: `custom-${index + 1}`,
    title: index === 0 ? "生活按下暂停键" : node.title,
    scene: index === 0
      ? `${character.name}正在经历：${character.dilemma}。现实没有立刻给出答案，故事会从她已有的资源、关系和限制开始，而不是靠巧合替她解决问题。`
      : node.scene.replace(/林澈/g, character.name),
    choices: node.choices.map((choice, choiceIndex) => ({ ...choice, id: `custom-${index + 1}-${choiceIndex}` })),
  }));
  return NextResponse.json({ jobId: crypto.randomUUID(), status: "first_chapter_ready", chapters: 5, provider: process.env.DASHSCOPE_API_KEY ? "bailian" : "safe-template", promptVersion: STORY_EDITOR_PROMPT_VERSION, story, preferences: body.preferences });
}
