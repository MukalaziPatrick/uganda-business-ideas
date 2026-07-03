export const HELP_OPTIONS = [
  "launch",
  "content",
  "leads",
  "registration",
  "operations",
] as const;

export type HelpOption = (typeof HELP_OPTIONS)[number];

export type FounderStage = "idea" | "started" | "selling";

export type IntakeProfile = {
  founderName: string;
  businessIdea: string;
  niche: string;
  audience: string;
  stage: FounderStage;
  budget: string;
  goals: string;
  helpNeeded: HelpOption[];
};

export type ChecklistItem = {
  dayNumber: number;
  title: string;
  detail: string;
};

export type ContentKind = "content_idea" | "post_draft" | "headline" | "email_cta";

export type ContentItem = {
  kind: ContentKind;
  body: string;
};
