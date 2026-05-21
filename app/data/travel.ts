export const STAY_TYPE_LABELS: Record<string, string> = {
  hotel: '🏨 Hotel',
  guesthouse: '🏡 Guesthouse',
  lodge: '🌿 Lodge',
  airbnb: '🏠 Airbnb',
  camping: '⛺ Camping',
};

export const STAY_AMENITY_OPTIONS = [
  'WiFi', 'Parking', 'Meals included', 'Hot water', 'Solar power',
  'Security', 'Swimming pool', 'Airport transfer', 'Air conditioning', 'Generator backup',
] as const;

export const BUDGET_RANGES = [
  { label: 'Any budget', min: null, max: null },
  { label: 'Under UGX 50k', min: null, max: 50000 },
  { label: 'UGX 50k – 150k', min: 50000, max: 150000 },
  { label: 'UGX 150k – 500k', min: 150000, max: 500000 },
  { label: 'UGX 500k+', min: 500000, max: null },
] as const;

export const SEED_DESTINATIONS = [
  { name: 'Bwindi Impenetrable Forest', slug: 'bwindi', region: 'South Western Uganda', description: 'Home to half the world\'s mountain gorillas. A UNESCO World Heritage Site and Uganda\'s most iconic destination for gorilla trekking.', activities: ['Gorilla Trekking', 'Bird Watching', 'Nature Walks'], sort_order: 1, is_featured: true },
  { name: 'Jinja', slug: 'jinja', region: 'Eastern Uganda', description: 'The adventure capital of East Africa, sitting at the source of the River Nile. Famous for white-water rafting, kayaking, and bungee jumping.', activities: ['White Water Rafting', 'Kayaking', 'Bungee Jumping', 'Nile Cruises'], sort_order: 2, is_featured: true },
  { name: 'Murchison Falls National Park', slug: 'murchison-falls', region: 'Northern Uganda', description: 'Uganda\'s largest national park, home to the world\'s most powerful waterfall and abundant wildlife including elephants, hippos, and lions.', activities: ['Safari Drives', 'Nile Boat Cruise', 'Waterfall Hike', 'Sport Fishing'], sort_order: 3, is_featured: true },
  { name: 'Queen Elizabeth National Park', slug: 'queen-elizabeth', region: 'Western Uganda', description: 'A diverse park offering savannah, forests, and wetlands. Famous for tree-climbing lions, chimpanzees, and the scenic Kazinga Channel.', activities: ['Game Drives', 'Boat Safari', 'Chimpanzee Tracking', 'Bird Watching'], sort_order: 4, is_featured: false },
  { name: 'Lake Bunyonyi', slug: 'lake-bunyonyi', region: 'South Western Uganda', description: 'One of the most beautiful lakes in Africa, dotted with 29 islands and surrounded by terraced hills. Perfect for canoeing and relaxation.', activities: ['Canoeing', 'Island Hopping', 'Swimming', 'Cultural Tours'], sort_order: 5, is_featured: false },
  { name: 'Fort Portal', slug: 'fort-portal', region: 'Western Uganda', description: 'Gateway to Kibale Forest and the crater lakes region. A charming town surrounded by tea plantations and volcanic crater lakes.', activities: ['Chimpanzee Tracking', 'Crater Lake Tours', 'Tea Plantation Visits', 'Bird Watching'], sort_order: 6, is_featured: true },
  { name: 'Rwenzori Mountains', slug: 'rwenzori', region: 'Western Uganda', description: 'The legendary Mountains of the Moon, offering challenging treks through afro-alpine vegetation to glaciated peaks straddling the equator.', activities: ['Mountain Trekking', 'Bird Watching', 'Glacier Views', 'Waterfalls'], sort_order: 7, is_featured: false },
  { name: 'Kampala', slug: 'kampala', region: 'Central Uganda', description: 'Uganda\'s vibrant capital city, built on seven hills. A bustling hub of culture, food, nightlife, and business with rich historical sites.', activities: ['City Tours', 'Food & Markets', 'Nightlife', 'Historical Sites', 'Shopping'], sort_order: 8, is_featured: false },
  { name: 'Entebbe', slug: 'entebbe', region: 'Central Uganda', description: 'Uganda\'s lakeside city on the shores of Lake Victoria. Home to the international airport, the Uganda Wildlife Education Centre, and beautiful botanical gardens.', activities: ['Lake Victoria Cruises', 'Uganda Wildlife Education Centre', 'Botanical Gardens', 'Beach Relaxation'], sort_order: 9, is_featured: false },
  { name: 'Mbale', slug: 'mbale', region: 'Eastern Uganda', description: 'Eastern Uganda\'s main city at the foot of Mount Elgon. A gateway for trekking, waterfalls, and exploring the Bugisu cultural heartland.', activities: ['Mount Elgon Trekking', 'Sipi Falls', 'Cultural Tours', 'Coffee Farm Visits'], sort_order: 10, is_featured: false },
  { name: 'Gulu', slug: 'gulu', region: 'Northern Uganda', description: 'Northern Uganda\'s largest city, now a growing hub of commerce and culture. Gateway to Murchison Falls and the Acholi cultural heritage.', activities: ['Cultural Heritage Tours', 'Murchison Falls Access', 'Local Markets', 'Community Tourism'], sort_order: 11, is_featured: false },
  { name: 'Kabale', slug: 'kabale', region: 'South Western Uganda', description: 'The gateway to Bwindi and Lake Bunyonyi, nicknamed "Little Switzerland" for its dramatic hilly landscape and cool highland climate.', activities: ['Lake Bunyonyi Access', 'Bwindi Gateway', 'Hiking', 'Cultural Visits'], sort_order: 12, is_featured: false },
] as const;
