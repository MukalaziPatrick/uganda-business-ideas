import type { ContentItem, IntakeProfile } from "../types";

export function buildContentStarters(profile: IntakeProfile): ContentItem[] {
  const idea = profile.businessIdea.trim();
  const audience = profile.audience.trim() || "your customers";
  const niche = profile.niche.trim() || "your market";
  const name = profile.founderName.trim();

  const contentIdeas: string[] = [
    `The moment I decided to start ${idea} — the problem I kept seeing everywhere`,
    `3 things ${audience} get wrong when choosing ${niche} options`,
    `A day behind the scenes: what it really takes to run ${idea}`,
    `The one question I ask every customer before they buy`,
    `Price transparency post: what you pay for and why it is worth it`,
    `Before and after: what changes for ${audience} after they try us`,
    `The biggest myth in ${niche} — and what the truth looks like`,
    `Meet the founder: why ${name} is building this for ${audience}`,
    `Customer story: the first person who said yes and what happened next`,
    `What I would tell anyone in ${audience.split(" ")[0] || "Uganda"} thinking about trying ${niche} for the first time`,
  ];

  const postDrafts: string[] = [
    `I kept watching ${audience} struggle with the same problem, so I built something about it.\n\nIt is called ${idea} — simple, fair, and made for exactly this.\n\nWe are open for our first customers this month. Message me and I will personally sort you out. 🚀`,
    `Quick question for ${audience}:\n\nWhat is the most frustrating part of dealing with ${niche} today?\n\nI am asking because ${idea} launches this month, and your answer decides what we fix first. Drop it in the comments or message me directly.`,
    `Launch week special.\n\n${idea} is live, and the first 10 customers get our launch offer.\n\nNo long forms, no waiting — message us on WhatsApp, call, or email and we will take care of you the same day.`,
  ];

  const headlines: string[] = [
    `Finally: ${niche} done right for ${audience}`,
    `${idea} — launching this month in Uganda`,
    `Stop settling. ${audience} deserve better ${niche}.`,
    `Your first step starts today with ${idea}`,
    `The easier way ${audience} are getting ${niche} sorted`,
  ];

  const emailCta = `Want first access? Leave your name, phone, and email and we will reach you before the public launch — plus you get the launch offer reserved for our first customers of ${idea}.`;

  return [
    ...contentIdeas.map((body) => ({ kind: "content_idea" as const, body })),
    ...postDrafts.map((body) => ({ kind: "post_draft" as const, body })),
    ...headlines.map((body) => ({ kind: "headline" as const, body })),
    { kind: "email_cta" as const, body: emailCta },
  ];
}
