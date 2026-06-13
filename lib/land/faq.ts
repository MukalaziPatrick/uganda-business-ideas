// lib/land/faq.ts
// Pre-written plain-language answers for the most common /land/ask questions.
// When a user's question closely matches one of these, we serve the cached answer
// instantly with ZERO OpenRouter API call. Novel questions fall through to the AI.

export type FaqEntry = {
  // Words that, when present together, strongly indicate this question.
  keywords: string[];
  // Plain-text answer (no markdown — the chat UI renders plain text only).
  answer: string;
};

export const FAQ: FaqEntry[] = [
  {
    // "How do I check if land has a clean title?"
    keywords: ['title', 'check', 'clean'],
    answer:
      "To check if land has a clean title, look up the title number on the government land portal at mlhud.go.ug, or use the UgNLIS app on your phone. " +
      "You are checking for three things. First, is the seller really the registered owner. Next, are there any caveats, which are warnings that someone else has a claim. Finally, is there a mortgage or loan tied to the land. " +
      "If you see any of these, be careful and ask questions before paying. " +
      "The safest way is our assisted land check for UGX 10,000, where an expert checks everything for you within 24 hours. You can also WhatsApp the agent to arrange a site visit.",
  },
  {
    // "What's the difference between Mailo and Freehold?"
    keywords: ['mailo', 'freehold'],
    answer:
      "Mailo and Freehold are both strong ways to own land in Uganda, but they are not the same. " +
      "Freehold means you fully own the land forever, with nothing standing between you and the government. " +
      "Mailo is mostly found in central Uganda, around Buganda. It feels like full ownership, but sometimes other people, called tenants, may already be living and farming on that land with legal rights. " +
      "So with Mailo, always ask if anyone is already on the land before you buy. With Freehold, this is usually not a worry. " +
      "There are also two other types you may hear about, Leasehold, which is a long government lease, and Customary, which is clan or family land.",
  },
  {
    // "When is the best time to buy land for farming?"
    keywords: ['best', 'time', 'farming'],
    answer:
      "The best time to buy land for farming is just before a rainy season, so you can plant soon after buying. " +
      "Most of Uganda has two rainy seasons. The first runs from March to May, and the second from September to November. In northern Uganda the main rains come from April to June. " +
      "Buying a month or two before the rains gives you time to check the title, visit the land, and prepare the soil. " +
      "Prices can also be calmer in the dry months, so you may find a better deal then. When you are ready, WhatsApp the agent to plan a site visit.",
  },
  {
    // "How does an assisted land check work?"
    keywords: ['assisted', 'check'],
    answer:
      "An assisted land check is when our expert does the hard checking for you. " +
      "It costs UGX 10,000 and gives you 24 hours of expert access. The expert looks up the title, confirms the real owner, and checks for caveats, loans, or disputes on the land. " +
      "You get a clear answer on whether the land is safe to buy, in simple words, without needing to understand the legal papers yourself. " +
      "This is the safest first step before paying any money for land. After the check, you can WhatsApp the agent to arrange a visit to see the land in person.",
  },
  {
    // "Which districts have the cheapest land?"
    keywords: ['district', 'cheap'],
    answer:
      "Land prices change a lot depending on how close the land is to a town or main road. " +
      "Land far from Kampala, in districts like Nakaseke, Nakasongola, Kiboga, Luwero, and parts of the north and east, is usually much cheaper than land near the city. " +
      "Cheaper land is great for farming, but always check why it is cheap. Look at the road, water, and whether the title is clean. " +
      "Browse our verified listings to compare prices by district, and use the assisted land check for UGX 10,000 before buying any low-priced land.",
  },
];

// Normalize text for matching: lowercase, strip punctuation, collapse spaces.
function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Try to match a user question to a cached FAQ answer.
 * Returns the answer string if confident, otherwise null (fall through to AI).
 * Only matches when ALL of an entry's keywords appear in the question — this keeps
 * false positives low so novel questions still reach the AI.
 */
export function matchFaq(question: string): string | null {
  const q = ` ${normalize(question)} `;
  for (const entry of FAQ) {
    const allPresent = entry.keywords.every((kw) => q.includes(` ${normalize(kw)} `));
    if (allPresent) return entry.answer;
  }
  return null;
}
