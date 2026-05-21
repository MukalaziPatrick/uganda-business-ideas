# ZuulaUganda Travel App — Design Spec
**Date:** 2026-05-21  
**Project:** Business Yoo (uganda-business-ideas)  
**Brand:** ZuulaUganda ("Zuula" = discover in Luganda)  
**Status:** Approved

---

## 1. Overview

A destination-led accommodation directory added as a new section inside Business Yoo at `/travel`. Travellers discover where to stay across Uganda by browsing destinations (Bwindi, Jinja, Murchison Falls, etc.), then filtering by accommodation type and budget. Contact options: WhatsApp, Booking.com affiliate link, or Request to Book form.

Monetised via Featured listings (flat monthly fee) and Booking.com affiliate commissions. No in-app payment in Phase 1.

Later spun out to a standalone domain (`zuulauganda.com`) once traffic validates the product.

---

## 2. Problem Being Solved

Most accommodation in Uganda — especially guesthouses, lodges, and camps outside Kampala — has no digital presence. Travellers cannot easily discover, compare, or contact these places. Booking.com and Airbnb ignore small local properties. ZuulaUganda fills this gap with a Uganda-specific, destination-first directory that works for both local travellers and international tourists.

---

## 3. Target Users

- **Domestic travellers** — Ugandans travelling within Uganda for leisure or work
- **International tourists** — visitors coming for gorilla trekking, safaris, Nile activities, etc.
- **Accommodation owners** — hotels, guesthouses, lodges, Airbnb hosts, campsite operators

---

## 4. Launch Destinations (12)

**Tourist magnets:**
- Bwindi Impenetrable Forest (gorilla trekking)
- Murchison Falls National Park
- Queen Elizabeth National Park
- Lake Bunyonyi
- Jinja (Source of the Nile)
- Rwenzori Mountains
- Fort Portal (Kibale Forest, crater lakes)

**Domestic travel hubs:**
- Kampala
- Entebbe
- Mbale
- Gulu
- Kabale

---

## 5. Pages

| Route | Purpose |
|-------|---------|
| `/travel` | Home: search bar + featured destination grid |
| `/travel/destinations` | Browse all 12 destinations |
| `/travel/destinations/[slug]` | Destination page with accommodation list |
| `/travel/stays/[id]` | Individual accommodation profile |
| `/travel/register` | Accommodation owner self-registration |
| `/admin/travel` | Admin: approve listings, toggle featured |

---

## 6. Home Page (`/travel`)

- Full-width search bar: "Search destination or accommodation..."
- Featured destination grid (2-column cards on mobile)
- Each destination card: background colour gradient, activity tag line, destination name, stay count
- "View all destinations →" link
- SEO: title "Find Places to Stay in Uganda | ZuulaUganda", canonical, OpenGraph
- `revalidate = 60`

---

## 7. Destination Page (`/travel/destinations/[slug]`)

### Hero
- Destination name, region, 2–3 sentence description
- Activity tags (e.g. Gorilla Trekking, Bird Watching, Rafting)

### Filters
- **Type** — All / Hotel / Guesthouse / Lodge / Airbnb / Camping
- **Budget** — Any / Under UGX 50k / UGX 50k–150k / UGX 150k–500k / UGX 500k+

### Accommodation list
- Count: "N places to stay near [destination]"
- Featured stays appear first with gold ⭐ FEATURED badge
- Each card: cover photo, name, type, town/area within destination, price from per night
- Contact buttons per card: WhatsApp + Booking.com (if listed) or Request to Book (if not)
- Load 20 at a time, "Load more" button

### SEO
- Title: "Places to Stay near [Destination] Uganda | ZuulaUganda"
- Canonical, OpenGraph, structured data for accommodation listings

---

## 8. Accommodation Profile (`/travel/stays/[id]`)

### Sections (top to bottom)

**Hero**
- Destination name breadcrumb
- Accommodation name, type, town, price from per night
- Featured badge if applicable

**Photo Gallery**
- Main photo (large) + 2 thumbnails + "+N more" tap to expand

**Quick Actions**
- WhatsApp button (`wa.me/` link)
- Booking.com button (affiliate URL, opens in new tab) — shown only if `booking_com_url` is set
- Request to Book button (scrolls to form) — shown if no Booking.com URL, or always as alternative

**Info Strip**
- Accommodation type, max capacity, check-in time, town/area

**About**
- Full description text

**Amenities**
- Tag chips: WiFi, Parking, Meals included, Hot water, Solar power, Security, Swimming pool, Airport transfer, etc.

**Room Types & Prices**
- List: room name, capacity, price per night in UGX
- Ordered by price ascending

**Request to Book Form**
- Fields: name, check-in date, check-out date, number of guests, WhatsApp number
- On submit: opens WhatsApp with pre-formatted message to accommodation's WhatsApp number
- Message format: "Hi, I'd like to book [accommodation name]. Name: [name]. Check-in: [date]. Check-out: [date]. Guests: [n]. My WhatsApp: [number]."
- No server-side processing needed — pure client-side WhatsApp deep link

**Location**
- Text address (district, region)
- "Open in Google Maps" button (links to Google Maps search for the accommodation name + location)

---

## 9. Registration Form (`/travel/register`)

Multi-step, 4 steps:

**Step 1 — Basic Info**
- Accommodation name (required)
- Type: Hotel / Guesthouse / Lodge / Airbnb / Camping (required)
- Destination (select from 12, required)
- Town/area within destination (required)
- WhatsApp number (required)
- Phone number (optional)
- Booking.com listing URL (optional — for affiliate link)
- Check-in / check-out times (required)
- Max capacity (required)
- Short description (required, max 500 chars)

**Step 2 — Amenities**
- Multi-select checklist: WiFi, Parking, Meals included, Hot water, Solar power, Security, Swimming pool, Airport transfer, Air conditioning, Generator backup

**Step 3 — Rooms & Photos**
- Add room types: name, capacity, price per night (minimum 1 room)
- Upload cover photo + gallery photos (3–10 photos)

**Step 4 — Submit**
- Sets `status = pending`
- Owner sees: "Your listing is under review. We'll contact you on WhatsApp once approved."

---

## 10. Admin Panel (`/admin/travel`)

Protected by existing Business Yoo admin auth gate.

- **Pending tab** — approve or reject new submissions
- **Active tab** — toggle Featured on/off, edit any listing
- **Destinations tab** — edit destination descriptions, photos, activity tags, sort order

---

## 11. Data Model (Supabase)

### `travel_destinations` table

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `name` | text | e.g. "Bwindi Impenetrable Forest" |
| `slug` | text unique | e.g. "bwindi" |
| `region` | text | e.g. "South Western Uganda" |
| `description` | text | 2–3 sentences |
| `activities` | text[] | e.g. ["Gorilla Trekking", "Bird Watching"] |
| `cover_photo_url` | text | nullable |
| `sort_order` | integer | home page order |
| `is_featured` | boolean | shows HOT badge on home |

### `travel_stays` table

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `name` | text | |
| `slug` | text unique | |
| `destination_id` | uuid FK | → travel_destinations.id |
| `type` | enum | `hotel`, `guesthouse`, `lodge`, `airbnb`, `camping` |
| `district` | text | |
| `town` | text | area within destination |
| `description` | text | |
| `price_from` | integer | UGX, cheapest room |
| `checkin_time` | text | e.g. "2:00 PM" |
| `checkout_time` | text | e.g. "11:00 AM" |
| `capacity` | integer | max guests |
| `whatsapp` | text | |
| `phone` | text | nullable |
| `booking_com_url` | text | nullable, affiliate URL |
| `amenities` | text[] | |
| `cover_photo_url` | text | nullable |
| `status` | enum | `pending`, `active`, `featured` |
| `created_at` | timestamptz | |

### `travel_stay_rooms` table

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `stay_id` | uuid FK | → travel_stays.id |
| `name` | text | e.g. "Standard Cabin" |
| `price_per_night` | integer | UGX |
| `capacity` | integer | guests |
| `sort_order` | integer | |

### `travel_stay_photos` table

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `stay_id` | uuid FK | → travel_stays.id |
| `photo_url` | text | |
| `caption` | text | nullable |
| `sort_order` | integer | |

### Indexes
- `travel_stays(destination_id)` — destination filter
- `travel_stays(status)` — active/featured filter
- `travel_stays(type)` — type filter
- `travel_stays(price_from)` — budget filter

---

## 12. Search & Filter Logic

Destination page query:
1. Filter `travel_stays` by `destination_id = [destination]`
2. Filter by `status IN ('active', 'featured')`
3. If type filter: `AND type = selected`
4. If budget filter: `AND price_from <= upper_bound` (and `>= lower_bound` if applicable)
5. Order: `featured` first, then `price_from ASC`

Home page search (global):
- Text search across `travel_destinations.name` and `travel_stays.name`
- Returns matching destinations first, then stays

---

## 13. Monetisation

| Stream | Detail |
|--------|--------|
| **Featured listing** | `status = featured` → gold badge, appears first. UGX 100,000–300,000/month. Manual MTN/Airtel Mobile Money payment to Mukalazi. Admin toggles featured on/off. |
| **Booking.com affiliate** | Accommodation owner provides their Booking.com URL. Mukalazi appends his affiliate tag before saving. Earns 4–6% on completed bookings. Apply free at partner.booking.com |
| **Request to Book (future)** | Lead fee per confirmed booking — not in Phase 1. |

---

## 14. Launch Strategy

**Phase 1 — Seed:**
- Mukalazi manually creates all 12 destination pages (text + cover photo)
- Seeds 5–8 accommodation listings per top 4 destinations (Bwindi, Jinja, Murchison, Fort Portal) — sourced from Google Maps, Facebook, TripAdvisor
- Self-service registration at `/travel/register` open from launch day
- Apply for Booking.com affiliate program before launch

**Phase 2 — Spin out (when traffic justifies):**
- Move to standalone `zuulauganda.com` or `zuula.ug`
- Keep same codebase, just change domain and branding
- Add booking.com affiliate tag to all existing URLs

---

## 15. Tech Stack

Follows existing Business Yoo patterns:
- **Framework:** Next.js 14 App Router
- **Database:** Supabase (PostgreSQL)
- **Storage:** Supabase Storage (photos)
- **Styling:** Tailwind CSS — new teal/green travel colour palette alongside existing Business Yoo palette
- **Deployment:** Vercel
- **No new dependencies required**
