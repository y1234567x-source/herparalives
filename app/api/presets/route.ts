import { listPublishedStories, listUpcomingStorySlots } from "@/server/story-repository";
import { NextResponse } from "next/server";
export async function GET() {
  const [presets, comingSoon] = await Promise.all([listPublishedStories(), listUpcomingStorySlots()]);
  return NextResponse.json({ version: "demo-2026.08.21", presets, comingSoon });
}
