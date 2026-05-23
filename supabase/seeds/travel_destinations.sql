-- supabase/seeds/travel_destinations.sql
-- Run this once after the migration to populate destination data.

insert into public.travel_destinations (name, slug, region, description, activities, sort_order, is_featured)
values
  ('Bwindi Impenetrable Forest', 'bwindi', 'South Western Uganda',
   'Home to half the world''s mountain gorillas. A UNESCO World Heritage Site and Uganda''s most iconic destination for gorilla trekking.',
   array['Gorilla Trekking','Bird Watching','Nature Walks'], 1, true),

  ('Jinja', 'jinja', 'Eastern Uganda',
   'The adventure capital of East Africa, sitting at the source of the River Nile. Famous for white-water rafting, kayaking, and bungee jumping.',
   array['White Water Rafting','Kayaking','Bungee Jumping','Nile Cruises'], 2, true),

  ('Murchison Falls National Park', 'murchison-falls', 'Northern Uganda',
   'Uganda''s largest national park, home to the world''s most powerful waterfall and abundant wildlife including elephants, hippos, and lions.',
   array['Safari Drives','Nile Boat Cruise','Waterfall Hike','Sport Fishing'], 3, true),

  ('Queen Elizabeth National Park', 'queen-elizabeth', 'Western Uganda',
   'A diverse park offering savannah, forests, and wetlands. Famous for tree-climbing lions, chimpanzees, and the scenic Kazinga Channel.',
   array['Game Drives','Boat Safari','Chimpanzee Tracking','Bird Watching'], 4, false),

  ('Lake Bunyonyi', 'lake-bunyonyi', 'South Western Uganda',
   'One of the most beautiful lakes in Africa, dotted with 29 islands and surrounded by terraced hills. Perfect for canoeing and relaxation.',
   array['Canoeing','Island Hopping','Swimming','Cultural Tours'], 5, false),

  ('Fort Portal', 'fort-portal', 'Western Uganda',
   'Gateway to Kibale Forest and the crater lakes region. A charming town surrounded by tea plantations and volcanic crater lakes.',
   array['Chimpanzee Tracking','Crater Lake Tours','Tea Plantation Visits','Bird Watching'], 6, true),

  ('Rwenzori Mountains', 'rwenzori', 'Western Uganda',
   'The legendary Mountains of the Moon, offering challenging treks through afro-alpine vegetation to glaciated peaks straddling the equator.',
   array['Mountain Trekking','Bird Watching','Glacier Views','Waterfalls'], 7, false),

  ('Kampala', 'kampala', 'Central Uganda',
   'Uganda''s vibrant capital city, built on seven hills. A bustling hub of culture, food, nightlife, and business with rich historical sites.',
   array['City Tours','Food & Markets','Nightlife','Historical Sites','Shopping'], 8, false),

  ('Entebbe', 'entebbe', 'Central Uganda',
   'Uganda''s lakeside city on the shores of Lake Victoria. Home to the international airport, the Uganda Wildlife Education Centre, and beautiful botanical gardens.',
   array['Lake Victoria Cruises','Uganda Wildlife Education Centre','Botanical Gardens','Beach Relaxation'], 9, false),

  ('Mbale', 'mbale', 'Eastern Uganda',
   'Eastern Uganda''s main city at the foot of Mount Elgon. A gateway for trekking, waterfalls, and exploring the Bugisu cultural heartland.',
   array['Mount Elgon Trekking','Sipi Falls','Cultural Tours','Coffee Farm Visits'], 10, false),

  ('Gulu', 'gulu', 'Northern Uganda',
   'Northern Uganda''s largest city, now a growing hub of commerce and culture. Gateway to Murchison Falls and the Acholi cultural heritage.',
   array['Cultural Heritage Tours','Murchison Falls Access','Local Markets','Community Tourism'], 11, false),

  ('Kabale', 'kabale', 'South Western Uganda',
   'The gateway to Bwindi and Lake Bunyonyi, nicknamed "Little Switzerland" for its dramatic hilly landscape and cool highland climate.',
   array['Lake Bunyonyi Access','Bwindi Gateway','Hiking','Cultural Visits'], 12, false)
;
