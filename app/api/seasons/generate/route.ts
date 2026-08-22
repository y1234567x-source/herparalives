import { NextResponse } from "next/server";
import { generateBailianJson, isBailianConfigured, getStructuredModel } from "@/server/ai/bailian";
import { STORY_EDITOR_PROMPT_VERSION } from "@/server/story-editor-prompt";

const fallbackWords = ["林澈", "若岚", "若溪"];

function replaceName(value: unknown, name: string): unknown {
  if (typeof value === "string") return value.replace(new RegExp(fallbackWords.join("|"), "g"), name);
  if (Array.isArray(value)) return value.map((item) => replaceName(item, name));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, replaceName(v, name)]));
  }
  return value;
}

export async function POST(request: Request) {
  const body = await request.json();
  const character = body.character;
  if (!character) return NextResponse.json({ error: "缺少角色卡" }, { status: 400 });

  const protagonist = character.name || "她";
  const context = JSON.stringify({
    character,
    preferences: body.preferences,
  });

  if (isBailianConfigured()) {
    try {
      const generated = await generateBailianJson({
        model: getStructuredModel(),
        system: "你是女性人生模拟器的编剧。必须基于用户角色真实处境生成全新的故事，不允许复用任何已有示例故事。主角名字必须保持一致。生成5章互动剧情，每章包含场景、选择和选择后的现实影响。",
        user: `请根据以下角色生成个性化人生故事：${context}`,
        temperature: 0.7,
        maxCompletionTokens: 5000,
      });
      const story = replaceName(generated, protagonist);
      return NextResponse.json({ jobId: crypto.randomUUID(), status: "first_chapter_ready", provider: "bailian", aiGenerated: true, promptVersion: STORY_EDITOR_PROMPT_VERSION, story, preferences: body.preferences });
    } catch (error) {
      console.error("story generation failed", error);
    }
  }

  return NextResponse.json({
    jobId: crypto.randomUUID(),
    status: "first_chapter_ready",
    provider: "fallback",
    aiGenerated: false,
    fallbackReason: "AI_GENERATION_FAILED",
    promptVersion: STORY_EDITOR_PROMPT_VERSION,
    story: {
      title: `${protagonist}的人生选择",
      chapters: [],
      message: "AI故事生成未成功，请检查模型配置。",
    },
    preferences: body.preferences,
  });
}
