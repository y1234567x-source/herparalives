export type StatKey = "career" | "wisdom" | "happiness" | "relationship" | "courage";

export type StatDelta = Partial<Record<StatKey, number>>;

export type StoryChoice = {
  id: string;
  label: string;
  hint: string;
  gain: string;
  cost: string;
  unknown: string;
  outcome: string;
  deltas: StatDelta;
  memory: string;
  nextNodeId?: string;
  endsStory?: boolean;
};

export type StoryNode = {
  id: string;
  chapter: number;
  chapterTitle: string;
  title: string;
  scene: string;
  dialogue?: string;
  coach: string;
  chapterEnd?: boolean;
  illustration?: string;
  choices: StoryChoice[];
};

export type Preset = {
  id: string;
  name: string;
  age: number;
  portrait: number;
  theme: string;
  tagline: string;
  situation: string;
  color: string;
  nodes: StoryNode[];
};

export type CharacterCard = {
  id: string;
  name: string;
  age?: number;
  portrait: number;
  background: string;
  goal: string;
  resources: string[];
  dilemma: string;
  isCustom: boolean;
  storyPreferences?: StoryPreferences;
  promptConstraints?: string[];
};

export type StoryPreferences = {
  difficulty: number;
  conflict: number;
  drama: number;
  realism: number;
};

export type ChoiceRecord = {
  nodeId: string;
  choiceId: string;
  choiceLabel: string;
  memory: string;
  deltas: StatDelta;
  at: number;
};

export type GameRun = {
  id: string;
  character: CharacterCard;
  presetId?: string;
  story: StoryNode[];
  currentIndex: number;
  currentNodeId?: string;
  visitedNodeIds?: string[];
  choices: ChoiceRecord[];
  branch: number;
  createdAt: number;
  updatedAt: number;
  finished: boolean;
  cardQuote?: string;
  cardSavedAt?: number;
};
