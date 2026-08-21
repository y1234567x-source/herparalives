"use client";

import { AppHeader } from "@/components/AppHeader";
import { Portrait } from "@/components/Portrait";
import { allRuns, createPresetRun } from "@/lib/store";
import type { Preset } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type ComingSoon = { name: string; note: string };

export default function LobbyPage() {
  const router = useRouter();
  const [stories, setStories] = useState<Preset[]>([]);
  const [comingSoon, setComingSoon] = useState<ComingSoon[]>([]);
  const [continueId, setContinueId] = useState<string>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setContinueId(allRuns().find((run) => !run.finished)?.id);
    fetch("/api/presets").then((response) => response.json()).then((data) => {
      setStories(data.presets || []); setComingSoon(data.comingSoon || []);
    }).finally(() => setLoading(false));
  }, []);

  const startStory = (story: Preset) => { const run = createPresetRun(story); router.push(`/play/${run.id}`); };

  return <main><AppHeader />
    <section className="story-entry"><div className="entry-copy"><p className="eyebrow dark">TWO WAYS TO BEGIN</p><h1>从你的处境出发，<br />或走进她的人生。</h1><p>你可以让 AI 将当下困境改写成自己的平行故事，也可以体验由真实经历启发、经授权与审核后虚构改编的女性故事。</p><button className="primary dark-button" onClick={() => router.push("/create")}>生成我的平行人生</button><small>原始描述仅用于本次生成，不保存到图鉴、日志或分享卡。</small></div><div className="entry-steps"><span><b>01</b>我的处境</span><i /><span><b>02</b>她们的故事</span><i /><span><b>03</b>重走与收藏</span></div></section>
    {continueId && <section className="continue-strip"><div><small>你还有一条线路正在发生</small><b>继续上次的平行人生</b></div><button onClick={() => router.push(`/play/${continueId}`)}>继续故事 →</button></section>}
    <section className="sample-section" id="stories"><div className="sample-head"><div><p className="eyebrow dark">CURATED WOMEN&apos;S STORIES</p><h2>她们的人生故事库</h2><p>故事内容从独立的服务端故事库读取，可以持续上架、下架和更新版本。真人经历需要明确授权，并经过脱敏、虚构改编与内容审核后才能发布。</p></div></div>
      {loading && <div className="library-status">正在读取故事库…</div>}
      <div className="story-library-grid">{stories.map((story) => <article className="library-card" key={story.id}><div><Portrait id={story.portrait} /></div><section><span>{story.theme} · {story.id === "test-story" ? "序章＋五章" : "五章完整故事"}</span><h3>{story.name}，{story.age}岁</h3><p>{story.tagline}</p><button onClick={() => startStory(story)}>进入她的人生 →</button></section></article>)}</div>
      {!loading && !stories.length && <div className="library-status">故事库正在准备中。</div>}
      <div className="empty-presets">{comingSoon.map((item) => <article key={item.name}><span>团队故事 · 待上架</span><h3>{item.name}</h3><p>{item.note}</p></article>)}</div>
    </section>
  </main>;
}
