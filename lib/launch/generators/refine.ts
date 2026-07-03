// V1 ships smart templates only — no AI calls. When FOS_AI_REFINE is enabled in a
// later phase, this is the single seam where an OpenRouter call gets added.
export function refineWithAI(text: string): string {
  if (process.env.FOS_AI_REFINE !== "true") {
    return text;
  }
  return text;
}
