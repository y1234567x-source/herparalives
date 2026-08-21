export const portraits = [
  { id: 0, name: "林澈 · 28岁", ageLabel: "初入转折", src: "/images/linan-portrait-v1.png" },
  { id: 1, name: "清禾 · 22岁", ageLabel: "初入职场", src: "/images/portrait-22-v1.png" },
  { id: 2, name: "舒言 · 35岁", ageLabel: "多重角色", src: "/images/portrait-35-v1.png" },
  { id: 3, name: "闻溪 · 45岁", ageLabel: "重新出发", src: "/images/portrait-45-v1.png" },
  { id: 4, name: "岚秋 · 58岁", ageLabel: "人生新章", src: "/images/portrait-58-v1.png" },
  { id: 5, name: "安然 · 28岁", ageLabel: "重启节奏", src: "/images/anran-portrait-v1.png" },
  { id: 6, name: "陆明薇 · 32岁", ageLabel: "学习靠近", src: "/images/lumingwei-portrait-v1.png" },
  { id: 7, name: "林晚 · 26岁", ageLabel: "双城之间", src: "/images/linwan-portrait-v1.png" },
  { id: 8, name: "许知夏 · 30岁", ageLabel: "再次出发", src: "/images/xuzhixia-portrait-v1.png" },
] as const;

// 创建角色时只提供固定的五个基础形象；故事库角色不会自动加入这里。
export const creationPortraits = portraits.slice(0, 5);

export const getPortrait = (id: number) => portraits.find((portrait) => portrait.id === id) ?? portraits[0];
