export type UgandaRegion = "Central" | "Eastern" | "Northern" | "Western";

export const BUSINESS_CATEGORIES = [
  "Restaurant",
  "Street Food",
  "Salon & Barbershop",
  "Plumber",
  "Electrician",
  "Retail Shop",
  "Agriculture & Farming",
  "Transport & Boda",
  "Health & Pharmacy",
  "Education & Tutoring",
  "Hotel & Accommodation",
  "Banks & Finance",
  "Gym & Fitness",
  "Church",
  "Mosque",
  "Police & Security",
  "Government Office",
  "Petrol Station",
  "Other",
] as const;

export type BusinessCategory = (typeof BUSINESS_CATEGORIES)[number];

export const UGANDA_REGIONS: UgandaRegion[] = [
  "Central",
  "Eastern",
  "Northern",
  "Western",
];

export const DISTRICTS_BY_REGION: Record<UgandaRegion, string[]> = {
  Central: [
    "Kampala", "Wakiso", "Mukono", "Luwero", "Masaka", "Kalangala",
    "Kiboga", "Mubende", "Mityana", "Nakaseke", "Nakasongola", "Buikwe",
    "Buvuma", "Gomba", "Kalungu", "Kyankwanzi", "Lwengo", "Lyantonde",
    "Mpigi", "Rakai", "Sembabule",
  ],
  Eastern: [
    "Jinja", "Mbale", "Tororo", "Iganga", "Soroti", "Kumi", "Kapchorwa",
    "Pallisa", "Kamuli", "Bugiri", "Mayuge", "Sironko", "Busia",
    "Budaka", "Bududa", "Bukedea", "Butaleja", "Buyende", "Kaliro",
    "Kibuku", "Luuka", "Manafwa", "Namayingo", "Namutumba", "Ngora",
    "Serere", "Butebo", "Namisindwa",
  ],
  Northern: [
    "Gulu", "Lira", "Arua", "Kitgum", "Apac", "Moroto", "Kotido",
    "Nebbi", "Adjumani", "Moyo", "Pader", "Amuria", "Nakapiripirit",
    "Abim", "Amolatar", "Amuru", "Dokolo", "Kaabong", "Koboko",
    "Maracha", "Oyam", "Agago", "Alebtong", "Amudat", "Kole",
    "Lamwo", "Napak", "Nwoya", "Otuke", "Zombo",
  ],
  Western: [
    "Mbarara", "Kabale", "Kasese", "Fort Portal", "Bushenyi", "Hoima",
    "Masindi", "Rukungiri", "Ntungamo", "Kibaale", "Kyenjojo", "Kamwenge",
    "Kabarole", "Kanungu", "Kiruhura", "Isingiro", "Kiryandongo",
    "Buliisa", "Buhweju", "Ibanda", "Kagadi", "Kakumiro", "Mitooma",
    "Rubanda", "Rubirizi", "Rwampara", "Sheema",
  ],
};

export function categoryEmoji(category: string): string {
  const map: Record<string, string> = {
    "Restaurant": "🍽️",
    "Street Food": "🌯",
    "Salon & Barbershop": "💇",
    "Plumber": "🔧",
    "Electrician": "⚡",
    "Retail Shop": "🛒",
    "Agriculture & Farming": "🌾",
    "Transport & Boda": "🏍️",
    "Health & Pharmacy": "💊",
    "Education & Tutoring": "📚",
    "Hotel & Accommodation": "🏨",
    "Banks & Finance": "🏦",
    "Gym & Fitness": "🏋️",
    "Church": "⛪",
    "Mosque": "🕌",
    "Police & Security": "🚔",
    "Government Office": "🏛️",
    "Petrol Station": "⛽",
    "Other": "💼",
  };
  return map[category] ?? "💼";
}
