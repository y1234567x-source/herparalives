"use client";
import { AppHeader } from "@/components/AppHeader";
import { ScrollRevealText } from "@/components/ScrollRevealText";
import { getRun, nodesForRun, saveRun } from "@/lib/store";
import type { ChoiceRecord, GameRun, StatDelta } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const statLabels: Record<string, string> = { career: "事业", wisdom: "智慧", happiness: "幸福", relationship: "关系", courage: "勇气" };
const sumChapter = (records: ChoiceRecord[]) => records.reduce<StatDelta>((sum, record) => { Object.entries(record.deltas).forEach(([key, value]) => { const stat = key as keyof StatDelta; sum[stat] = (sum[stat] || 0) + (value || 0); }); return sum; }, {});

export default function PlayPage() {
  const id = String(useParams().runId); const router = useRouter(); const [run, setRun] = useState<GameRun>();
  const [selectedChoiceId, setSelectedChoiceId] = useState<string>();
  useEffect(() => setRun(getRun(id)), [id]);
  const nodes = useMemo(() => run ? nodesForRun(run) : [], [run]); const current = run ? (nodes.find((node) => node.id === run.currentNodeId) ?? nodes[run.currentIndex]) : undefined;
  if (!run || !current) return <main><AppHeader /><section className="prepare"><h2>这条旧线路已经更新</h2><p>故事结构已重写，请从角色大厅重新开始测试。</p><Link className="primary dark-button" href="/lobby#sample">返回测试故事</Link></section></main>;

  const savedChoice = run.choices.findLast((item) => item.nodeId === current.id);
  const resolvedChoice = current.choices.find((item) => item.id === (selectedChoiceId || savedChoice?.choiceId));
  const choose = (choiceIndex: number) => {
    if (resolvedChoice) return;
    const selected = current.choices[choiceIndex];
    const record: ChoiceRecord = { nodeId: current.id, choiceId: selected.id, choiceLabel: selected.label, memory: selected.memory, deltas: selected.deltas, at: Date.now() };
    const withChoice = { ...run, choices: [...run.choices, record], updatedAt: Date.now() };
    saveRun(withChoice); setRun(withChoice); setSelectedChoiceId(selected.id);
    window.setTimeout(() => document.getElementById("choice-outcome")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };
  const continueStory = () => {
    if (!resolvedChoice) return;
    const fallback = nodes[run.currentIndex + 1];
    const nextNodeId = resolvedChoice.nextNodeId ?? fallback?.id;
    const nextIndex = nextNodeId ? nodes.findIndex((node) => node.id === nextNodeId) : -1;
    const finished = Boolean(resolvedChoice.endsStory) || nextIndex < 0;
    const visited = run.visitedNodeIds?.length ? run.visitedNodeIds : nodes.slice(0, run.currentIndex + 1).map((node) => node.id);
    const next = { ...run, currentIndex: finished ? run.currentIndex : nextIndex, currentNodeId: finished ? current.id : nextNodeId, visitedNodeIds: finished || !nextNodeId ? visited : [...visited.filter((nodeId) => nodeId !== nextNodeId), nextNodeId], finished, updatedAt: Date.now() };
    saveRun(next); setSelectedChoiceId(undefined); if (finished) router.push(`/ending/${run.id}`); else { setRun(next); window.scrollTo({ top: 0, behavior: "smooth" }); }
  };
  const previous = run.choices.at(-1);
  const chapterNumbers = [...new Set(nodes.map((node) => node.chapter))];
  const visitedIds = run.visitedNodeIds?.length ? run.visitedNodeIds : nodes.slice(0, run.currentIndex + 1).map((node) => node.id);
  const sceneInChapter = visitedIds.map((nodeId) => nodes.find((node) => node.id === nodeId)).filter((node) => node?.chapter === current.chapter).findIndex((node) => node?.id === current.id) + 1;
  const hasPrologue = run.presetId === "test-story";
  const chapterLabel = hasPrologue && current.chapter === 1 ? "PROLOGUE" : `CHAPTER ${hasPrologue ? current.chapter - 1 : current.chapter}`;
  const chapterDeltas = sumChapter(run.choices.filter((item) => nodes.find((storyNode) => storyNode.id === item.nodeId)?.chapter === current.chapter));
  return <main className="play-page"><AppHeader compact /><div className="chapter-progress"><span>{current.chapterTitle} · 第 {sceneInChapter} 幕</span><div>{chapterNumbers.map((chapter) => <i className={chapter <= current.chapter ? "active" : ""} key={chapter} />)}</div><Link href={`/map/${run.id}`}>查看人生地图</Link></div><section className="story-stage"><div className="scene-art illustrated"><Image src={current.illustration || "/images/linan-ch1-v1.png"} alt={`${current.title}手绘剧情场景`} fill priority sizes="(max-width: 760px) 100vw, 52vw" /><div className="scene-vignette" /><small>关键场景 · 手绘叙事插画</small></div><article className="story-panel">{previous && run.currentIndex > 0 && <p className="memory-echo">人物记得：{previous.memory}</p>}<p className="scene-count">{chapterLabel} · SCENE {sceneInChapter}</p><h1>{current.title}</h1><ScrollRevealText className="scene-text rich-scene" text={current.scene} />{current.dialogue && <blockquote>{current.dialogue}</blockquote>}{!resolvedChoice && <div className="choices"><p>故事走到这里，{run.character.name}准备如何回应？</p>{current.choices.map((item, index) => <button onClick={() => choose(index)} key={item.id}><b>{String.fromCharCode(65 + index)}</b><span><strong>{item.label}</strong><small>{item.hint}</small></span><em>→</em></button>)}</div>}
    {resolvedChoice && <section className="inline-outcome" id="choice-outcome"><p className="eyebrow">YOUR CHOICE · {resolvedChoice.label}</p><h2>选择之后，生活继续发生</h2><ScrollRevealText className="outcome-story" text={resolvedChoice.outcome} /><div className="consequence-grid"><div><small>获得</small><p>{resolvedChoice.gain}</p></div><div><small>代价</small><p>{resolvedChoice.cost}</p></div><div><small>仍然未知</small><p>{resolvedChoice.unknown}</p></div></div>{current.chapterEnd && <section className="inline-coach"><p className="eyebrow">{chapterLabel} · LIFE COACH</p><h3>这一章，先在这里停一下</h3><p className="chapter-summary">以下五维只记录本章变化，不代表选择的好坏。</p><div className="delta-row">{Object.entries(chapterDeltas).filter(([, value]) => value).map(([key, value]) => <span key={key}><b>{statLabels[key]}</b><em className={(value || 0) > 0 ? "up" : "down"}>{(value || 0) > 0 ? "+" : ""}{value}</em></span>)}</div><div className="coach"><small>章末镜面 · 不替你决定</small><p>{current.coach}</p></div><small className="no-rank">Coach 从本章经历中提出问题，不提供标准答案。</small></section>}<button className="primary story-continue full" onClick={continueStory}>{resolvedChoice.endsStory || (!resolvedChoice.nextNodeId && run.currentIndex === nodes.length - 1) ? "听听 Life Coach 的旅途回望" : current.chapterEnd ? "进入下一章" : "继续下一幕"}</button></section>}</article></section>
  </main>;
}
