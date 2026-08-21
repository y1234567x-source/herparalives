import type { Preset } from "@/lib/types";

export type StoryLibraryRecord = Preset & {
  status: "draft" | "review" | "published" | "archived";
  version: string;
  sourceType: "team" | "invited" | "editorial";
  consentConfirmed: boolean;
  publishedAt?: string;
};
