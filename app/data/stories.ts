// app/data/stories.ts
// ─────────────────────────────────────────────────────────────────────────────
// SUCCESS STORIES
//
// ── HOW TO ADD YOUR YOUTUBE VIDEO ────────────────────────────────────────────
//   1. Upload your video to YouTube
//   2. Open the video — copy the ID from the URL
//      Example: youtube.com/watch?v=ABC123xyz  →  ID is "ABC123xyz"
//   3. Find the story for that idea below
//   4. Add the line:  youtubeId: "ABC123xyz"
//   5. Save — the video embeds automatically on the idea page
//
// ── HOW TO ADD A NEW STORY ────────────────────────────────────────────────────
//   1. Copy any story block below
//   2. Update all fields — give it a unique id
//   3. Set ideaSlugs to the slug(s) of the idea page you want it on
//      (e.g. ideaSlugs: ["poultry-farming"])
// ─────────────────────────────────────────────────────────────────────────────

export type Story = {
  id: string;
  ideaSlugs: string[];   // which idea detail pages this story appears on
  categories: string[];  // also shows on pages where idea.category matches
  name: string;
  location: string;
  business: string;
  quote: string;
  result: string;
  timeframe: string;
  youtubeId?: string;    // ← paste YouTube video ID here when you have one
  avatarEmoji: string;
};

export const stories: Story[] = [
  // ── Agriculture ──────────────────────────────────────────────────────────
  {
    id: "sarah-nakato-poultry",
    ideaSlugs: ["poultry-farming"],
    categories: ["Agriculture"],
    name: "Sarah Nakato",
    location: "Wakiso District",
    business: "Poultry Farm — 80 broilers",
    quote:
      "I started with just 30 chicks and UGX 600,000. I didn't know anything about poultry. I watched videos, talked to neighbours, and just started. By month three I was making a profit.",
    result: "Earns UGX 700k–900k per 8-week cycle",
    timeframe: "Started with UGX 600,000 in early 2024",
    // youtubeId: "",  ← add your YouTube video ID here when ready
    avatarEmoji: "👩🏾",
  },
  {
    id: "robert-kiggundu-pig",
    ideaSlugs: ["pig-farming"],
    categories: ["Agriculture"],
    name: "Robert Kiggundu",
    location: "Masaka",
    business: "Pig Farm — 6 pigs + 1 breeding sow",
    quote:
      "Pigs are hard work but the money is real. I clean the sty every morning — it takes 30 minutes. That routine is the difference between sick pigs and healthy ones.",
    result: "Earns UGX 1.2M–2M per quarter",
    timeframe: "Started with 3 piglets in 2022",
    // youtubeId: "",  ← add your YouTube video ID here when ready
    avatarEmoji: "👨🏿",
  },
  {
    id: "anne-kiiza-feed",
    ideaSlugs: ["animal-feed-supply-business"],
    categories: ["Agriculture"],
    name: "Anne Kiiza",
    location: "Mbarara",
    business: "Animal Feed Supplier to 12 local farmers",
    quote:
      "I started by buying feed for my own chickens in bulk and selling the extra to neighbours. Once they saw I always had stock and could deliver, the orders grew on their own.",
    result: "Supplies 12 regular farmers, earns UGX 1M+/month",
    timeframe: "Grew from personal buyer to supplier in 6 months",
    // youtubeId: "",  ← add your YouTube video ID here when ready
    avatarEmoji: "👩🏿",
  },

  // ── Food ─────────────────────────────────────────────────────────────────
  {
    id: "grace-atim-chapati",
    ideaSlugs: ["chapati-business"],
    categories: ["Food"],
    name: "Grace Atim",
    location: "Gulu Town",
    business: "Chapati & Rolex Stand near a school gate",
    quote:
      "I started with one pan and a charcoal stove near a school gate. Within two weeks I had regular students every morning. The rolex is what made me known in the whole area.",
    result: "Serves 60–80 customers daily, earns UGX 800k/month",
    timeframe: "Started with UGX 150,000 in 2023",
    // youtubeId: "",  ← add your YouTube video ID here when ready
    avatarEmoji: "👩🏽",
  },
  {
    id: "hassan-mugisha-juice",
    ideaSlugs: ["fresh-juice-business"],
    categories: ["Food"],
    name: "Hassan Mugisha",
    location: "Mbarara Town",
    business: "Fresh Juice & Smoothie Stall",
    quote:
      "I set up near a gym and a secondary school. The gym crowd buys every morning, the students in the afternoon. Two different customers, one stall, income all day.",
    result: "Earns UGX 600k–900k per month from two shifts",
    timeframe: "Started with a blender and UGX 350,000 in 2024",
    // youtubeId: "",  ← add your YouTube video ID here when ready
    avatarEmoji: "👨🏾",
  },

  // ── Services ─────────────────────────────────────────────────────────────
  {
    id: "john-mukasa-mobile-money",
    ideaSlugs: ["mobile-money-business"],
    categories: ["Services"],
    name: "John Mukasa",
    location: "Nakawa, Kampala",
    business: "Mobile Money Agent — MTN & Airtel dual point",
    quote:
      "The first month was hard because I kept running out of float. Once I learned to manage my cash and float separately, everything changed. Now I never run out.",
    result: "Earns UGX 1.2M–1.8M per month consistently",
    timeframe: "Opened his first point in 2023",
    // youtubeId: "",  ← add your YouTube video ID here when ready
    avatarEmoji: "👨🏾",
  },
  {
    id: "mary-nalubega-soap",
    ideaSlugs: ["liquid-soap-business"],
    categories: ["Services"],
    name: "Mary Nalubega",
    location: "Mukono",
    business: "Liquid Soap — supplies 4 schools monthly",
    quote:
      "I was making soap at home and giving samples to teachers. One headmistress placed a bulk order and that was it. Now I supply four schools every month without advertising.",
    result: "Earns UGX 500k–800k per month",
    timeframe: "Started from home with UGX 120,000 in 2023",
    // youtubeId: "",  ← add your YouTube video ID here when ready
    avatarEmoji: "👩🏾",
  },
  {
    id: "patricia-nantongo-tailoring",
    ideaSlugs: ["tailoring-business"],
    categories: ["Services"],
    name: "Patricia Nantongo",
    location: "Entebbe",
    business: "Tailoring — school uniforms and wedding wear",
    quote:
      "School uniform contracts saved my business. Every August before term three, bulk orders cover two months of rent. I now plan my whole year around that season.",
    result: "Earns UGX 1M–2M monthly, more during school terms",
    timeframe: "Opened with 1 sewing machine and UGX 800,000",
    // youtubeId: "",  ← add your YouTube video ID here when ready
    avatarEmoji: "👩🏾",
  },
  {
    id: "ibrahim-wasswa-boda",
    ideaSlugs: ["boda-boda-business"],
    categories: ["Services"],
    name: "Ibrahim Wasswa",
    location: "Jinja",
    business: "Boda Boda — personal owner-operator",
    quote:
      "I borrowed UGX 1.5M to add to my savings and bought a second-hand bike. I paid the loan back in four months. Now the bike is fully mine and every shilling is profit.",
    result: "Takes home UGX 1.5M–2M per month after all costs",
    timeframe: "Started riding in 2022, fully owns his bike now",
    // youtubeId: "",  ← add your YouTube video ID here when ready
    avatarEmoji: "👨🏾",
  },

  // ── Retail ───────────────────────────────────────────────────────────────
  {
    id: "david-ssebuliba-fruit",
    ideaSlugs: ["fruit-selling"],
    categories: ["Retail"],
    name: "David Ssebuliba",
    location: "Ntinda, Kampala",
    business: "Fruit Stand — pineapples, mangoes, watermelon",
    quote:
      "I chose Ntinda because residents have money and don't want crowded markets. I charge a little more and they pay it because I'm right there when they need fruit.",
    result: "Net profit of UGX 900k–1.1M per month",
    timeframe: "Started with UGX 200,000 at a roadside spot",
    // youtubeId: "",  ← add your YouTube video ID here when ready
    avatarEmoji: "👨🏾",
  },
  {
    id: "florence-namukasa-mitumba",
    ideaSlugs: ["mitumba-clothes-business"],
    categories: ["Retail"],
    name: "Florence Namukasa",
    location: "Kalerwe Market, Kampala",
    business: "Mitumba — women's clothing, 3 bales per week",
    quote:
      "The first bale I opened was almost all Grade C. I lost money. The second I was more careful. By the fifth bale I knew exactly what to look for and who to buy from.",
    result: "Earns UGX 1.5M–2M per month at full pace",
    timeframe: "Started with one mixed bale costing UGX 180,000",
    // youtubeId: "",  ← add your YouTube video ID here when ready
    avatarEmoji: "👩🏿",
  },
];