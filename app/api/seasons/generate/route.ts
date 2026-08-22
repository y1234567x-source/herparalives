import { NextResponse } from "next/server";
import { generateBailianJson, isBailianConfigured, getStructuredModel } from "@/server/ai/bailian";
import { STORY_EDITOR_PROMPT_VERSION } from "@/server/story-editor-prompt";

const fallbackWords = ["林澈", "若岚", "若溪"];

function replaceName(value: unknown, name: string): unknown {
  if (typeof value === "string") return value.replace(new RegExp(fallbackWords.join("|"), "g"), name);
  if (Array.isArray(value)) return value.map((item) => replaceName(item, name));
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, replaceName(v, name)]));
  return value;
}

export async function POST(request: Request) {
  const body = await request.json();
  const character = body.character;
  if (!character) return NextResponse.json({ error: "缺少角色卡" }, { status: 400 });

  const protagonist = character.name || "她";

  if (isBailianConfigured()) {
    try {
      const generated = await generateBailianJson({
        model: getStructuredModel(),
        system: "你是女性人生模拟器编剧。必须根据用户角色和现实处境重新创作故事，不允许复用示例故事。主角名字必须保持一致。",
        user: JSON.stringify({ character, preferences: body.preferences }),
        temperature: 0.7,
        maxCompletionTokens: 5000,
      });

      return NextResponse.json({
        jobId: crypto.randomUUID(),
        status: "first_chapter_ready",
        provider: "bailian",
        aiGenerated: true,
        promptVersion: STORY_EDITOR_PROMPT_VERSION,
        story: replaceName(generated, protagonist),
        preferences: body.preferences,
      });
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
      title: `${protagonist}的人生选择`,
      chapters: [],
      message: "AI故事生成未成功，请检查模型配置。",
    },
    preferences: body.preferences,
  });
}
