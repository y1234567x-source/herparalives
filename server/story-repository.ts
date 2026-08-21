import "server-only";
import { comingSoon, presets } from "./story-library";

// Demo 使用仓库内的服务端种子数据。正式接入 CloudBase 后，只需替换本文件的读取实现；
// 页面、游戏存档和 /api/presets 的返回结构不需要改变。
export async function listPublishedStories() {
  return presets
    .filter((story) => story.status === "published" && story.consentConfirmed)
    .map(({ status, consentConfirmed, ...publicStory }) => publicStory);
}

export async function listUpcomingStorySlots() {
  return comingSoon;
}
