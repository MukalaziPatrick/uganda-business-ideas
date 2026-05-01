# Uganda Business Ideas — Codex Execution Brief

**Project:** Uganda Business Ideas (UBI)  
**Owner:** Mukalazi  
**Document purpose:** One implementation brief that Codex can follow inside the project folder.  
**Date prepared:** 2026-04-30  
**Primary objective:** Turn the current static MVP into a revenue-ready Uganda-first business discovery platform before the end of 2026.

---

## 0. Read This First

This document combines:

1. The original UBI project report.
2. The Perplexity-improved business plan.
3. The Perplexity-generated list of Uganda business ideas.
4. Current implementation research on SEO, local mobile-first usage, content structure, and monetization sequencing.

### Key Decision

UBI should **not** start with complex AI, full accounts, or a mobile app.

The fastest realistic income path is:

> **SEO idea pages + supplier listings + paid PDF guides + WhatsApp lead capture.**

AI recommendations can come later after the site has content, search traffic, click data, and supplier demand.

---

## 1. Codex Operating Rules

Codex must follow these rules before editing the project.

### 1.1 Safety Rules

| Rule | Instruction |
|---|---|
| Start read-only | First inspect files only. Do not edit until the audit is complete. |
| Do not delete | Do not delete files, routes, data, or styling unless the owner approves. |
| Keep changes small | Work in clear phases. Avoid rewriting the whole app at once. |
| Use existing stack | Assume Next.js App Router, TypeScript, Tailwind, Vercel. |
| Avoid fake data | Do not invent supplier phone numbers, exact profits, or legal guarantees. |
| Approval gates | Ask before database migration, payment integration, major redesign, or env changes. |
| Full files | When returning code, label every file and return complete file content. |

### 1.2 First Command Step

Codex should start inside the project root and run read-only inspection.

#### If terminal is PowerShell

```powershell
Get-Location
git status
Get-ChildItem -Force
Get-ChildItem -Recurse -Depth 2 | Select-Object FullName
```

#### If terminal is Bash

```bash
pwd
git status
find . -maxdepth 2 -type f | sort
find . -maxdepth 2 -type d | sort
```

### 1.3 Initial Codex Prompt

Copy this into Codex first:

```text
Inspect this Next.js App Router project read-only. Do not edit yet. Identify current routes, data files, SEO files, components, styling setup, and deployment config. Then propose the smallest safe implementation plan for UBI income readiness: dynamic idea pages, metadata, sitemap, supplier cards, WhatsApp CTA, guides, advertise page, lead capture, analytics events. Wait for approval before changes.
```

---

## 2. Business Strategy Codex Must Build Toward

### 2.1 Positioning

UBI is not just a list of ideas.

It should become:

> A Uganda-first business discovery platform that helps people choose realistic businesses, understand startup costs and risks, find where to buy inputs, contact suppliers, and take the next step through guides or direct support.

### 2.2 Primary Audiences

| Audience | What They Need | Example Content |
|---|---|---|
| Youth | Low-capital ideas, skills, fast action steps | Businesses under 500k UGX |
| Farmers | Agriculture and trading ideas | Poultry, goats, vegetables, produce trading |
| Women/mothers | Practical home and local service ideas | Daycare, tailoring, food, retail |
| Diaspora | Investment clarity and trusted local supply support | Agriculture packages, supplier contacts |
| Suppliers | Visibility and leads | Featured supplier listings |

### 2.3 First Revenue Model

Do these first:

1. **Supplier listings**
2. **Paid PDF guides**
3. **WhatsApp lead capture**
4. **Featured idea placements**
5. **Manual consultation/support**

Avoid relying on AdSense first. Traffic will likely be too low at the beginning.

### 2.4 Realistic Uganda Revenue Yardstick

Target by December 2026:

| Revenue Source | Example Pricing | Target Volume | Monthly Revenue |
|---|---:|---:|---:|
| Supplier starter listings | 50,000 UGX/month | 10 suppliers | 500,000 UGX |
| Paid PDF guides | 20,000 UGX/guide | 20 sales/month | 400,000 UGX |
| Lead/support facilitation | 20,000 UGX/case | 5 cases/month | 100,000 UGX |
| **Total target** |  |  | **1,000,000 UGX/month** |

This is a realistic first serious target. Bigger revenue requires stronger traffic, suppliers, and guide sales.

---

## 3. Product Scope

### 3.1 Build Now

| Feature | Purpose |
|---|---|
| `/ideas/[slug]` | One SEO page per business idea |
| Idea metadata | Rank on Google and improve social sharing |
| Visible FAQs | Help users and AI search understand the page |
| Supplier cards | Create monetization inventory |
| WhatsApp CTAs | Convert visitors into leads quickly |
| `/guides` | Sell practical PDF guides manually first |
| `/advertise` | Explain supplier listing packages |
| `/blog/[slug]` | Build long-tail SEO traffic |
| Analytics events | Know what users click and want |

### 3.2 Build Later

| Feature | Wait Until |
|---|---|
| AI recommendation engine | After 500+ real sessions or enough idea click data |
| User accounts | After users ask to save ideas or return often |
| Supabase migration | After static data becomes difficult to manage |
| Online payment integration | After guide sales happen manually |
| Mobile app | After web product proves demand |

---

## 4. Recommended Project Structure

Codex should adapt to the existing folder structure, but this is the target shape.

```text
app/
  page.tsx
  layout.tsx
  sitemap.ts
  robots.ts
  ideas/
    page.tsx
    [slug]/
      page.tsx
  categories/
    [slug]/
      page.tsx
  budget/
    [slug]/
      page.tsx
  guides/
    page.tsx
    [slug]/
      page.tsx
  blog/
    page.tsx
    [slug]/
      page.tsx
  suppliers/
    page.tsx
  advertise/
    page.tsx
  start-here/
    page.tsx

components/
  IdeaCard.tsx
  IdeaFilters.tsx
  SupplierCard.tsx
  WhatsAppCTA.tsx
  GuideCard.tsx
  SeoJsonLd.tsx
  LeadCaptureForm.tsx

data/
  ideas.ts
  suppliers.ts
  guides.ts
  blogPosts.ts

lib/
  seo.ts
  analytics.ts
  slug.ts
  money.ts
  whatsapp.ts

docs/
  UBI_CODEX_EXECUTION_PLAN.md
```

---

## 5. Data Model Codex Should Use

### 5.1 Business Idea Type

```ts
export type BudgetBand = "under_500k" | "500k_2m" | "above_2m" | "review";

export type IdeaCategory =
  | "Agriculture"
  | "Food"
  | "Retail"
  | "Services"
  | "Digital";

export type ContactStatus = "verified" | "needs_verification" | "placeholder";

export interface BusinessIdea {
  id: string;
  slug: string;
  title: string;
  category: IdeaCategory;
  budgetBand: BudgetBand;
  startupCapitalRange: string;
  shortDescription: string;
  fullDescription: string;
  bestFor: string[];
  skillsRequired: string[];
  risks: string[];
  profitPotential: string;
  timeToStart: string;
  whereToBuy: WhereToBuyItem[];
  supplierSlugs: string[];
  faqs: IdeaFaq[];
  ctaLabel: string;
  lastReviewed: string;
}

export interface WhereToBuyItem {
  item: string;
  location: string;
  note: string;
  contactStatus: ContactStatus;
}

export interface IdeaFaq {
  question: string;
  answer: string;
}
```

### 5.2 Supplier Type

```ts
export interface Supplier {
  id: string;
  slug: string;
  name: string;
  category: IdeaCategory | "General";
  location: string;
  description: string;
  phone?: string;
  whatsapp?: string;
  website?: string;
  contactStatus: "verified" | "needs_verification" | "placeholder";
  isFeatured: boolean;
  package?: "starter" | "standard" | "featured";
}
```

### 5.3 Guide Type

```ts
export interface Guide {
  id: string;
  slug: string;
  title: string;
  priceUGX: number;
  summary: string;
  targetAudience: string[];
  relatedIdeaSlugs: string[];
  paymentStatus: "manual_mobile_money" | "coming_soon";
  whatsappMessage: string;
}
```

---

## 6. Public Idea Inventory

The Perplexity source list contains **51 entries**. Use the first 50 as public ideas. Keep #51 as an internal UBI content/SEO strategy idea unless the owner approves publishing it.

| # | Slug | Title | App Category | Budget Band | Startup Capital | Best For | Use |
|---:|---|---|---|---|---|---|---|
| 1 | `tomato-farming-uganda` | Tomato farming (small-scale) | Agriculture | `500k_2m` | 500k–2M | Rural youth, farmers | Public idea |
| 2 | `vegetable-kitchen-gardening-uganda` | Vegetable/kitchen gardening (sukuma, dodo, onions, herbs) | Agriculture | `under_500k` | Under 500k | Urban & peri‑urban households, women | Public idea |
| 3 | `matooke-farming-uganda` | Matooke (banana) farming | Agriculture | `above_2m` | Above 2M (land + planting materials) | Land owners in high‑rainfall areas | Public idea |
| 4 | `maize-millet-rice-cultivation-uganda` | Maize/millet/rice cultivation (small commercial plot) | Agriculture | `500k_2m` | 500k–2M (leased land, seed, basic tools) | Rural farmers | Public idea |
| 5 | `goat-farming-uganda` | Goat farming (meat goats) | Agriculture | `500k_2m` | 500k–2M (few breeding animals + shelter) | Rural households | Public idea |
| 6 | `sheep-farming-uganda` | Sheep farming (meat + wool where market exists) | Agriculture | `500k_2m` | 500k–2M | Areas with grazing land | Public idea |
| 7 | `rabbit-farming-uganda` | Rabbit farming | Agriculture | `under_500k` | Under 500k–1M | Youth, farmers with limited space | Public idea |
| 8 | `small-scale-poultry-uganda` | Small-scale poultry (broilers or layers) | Agriculture | `500k_2m` | 500k–2M (depending on flock size) | Farmers, youth near towns | Public idea |
| 9 | `fish-farming-uganda` | Fish farming (ponds or tanks) | Agriculture | `above_2m` | Above 2M (pond construction or tanks + feed) | Land owners, cooperatives | Public idea |
| 10 | `dairy-farming-uganda` | Dairy farming (2-10 cows or zero-grazing) | Agriculture | `above_2m` | Above 2M | Rural households with land and water | Public idea |
| 11 | `juice-production-from-local-fruits-uganda` | Juice production from local fruits (pineapple, mango, passion) | Agriculture | `500k_2m` | 500k–2M | Youth near fruit‑growing areas | Public idea |
| 12 | `groundnut-or-soybean-farming-uganda` | Groundnut or soybean farming (for grain and value addition) | Agriculture | `500k_2m` | 500k–2M | Farmers in suitable regions | Public idea |
| 13 | `produce-trading-uganda` | Produce trading (buy from farmers, sell in town markets) | Agriculture | `under_500k` | Under 500k–1.5M | Youth with access to transport | Public idea |
| 14 | `agro-input-shop-uganda` | Agro-input shop (seeds, fertilizers, vet drugs) | Agriculture | `above_2m` | Above 2M (stock) | People in trading centers near farmers | Public idea |
| 15 | `agro-forestry-fruit-tree-planting-uganda` | Agro-forestry/fruit tree planting (avocado, mango, coffee) | Agriculture | `500k_2m` | 500k–2M initially (seedlings) | Land owners thinking long‑term | Public idea |
| 16 | `chapati-rollex-street-stall-uganda` | Chapati/Rollex street stall | Food | `under_500k` | Under 500k | Youth in busy centers | Public idea |
| 17 | `local-food-takeaway-uganda` | Local food takeaway (rice, beans, posho, matooke) | Food | `500k_2m` | 500k–2M | Women, youth near offices or stages | Public idea |
| 18 | `fresh-juice-and-smoothie-bar-uganda` | Fresh juice and smoothie bar | Food | `500k_2m` | 500k–2M | Youth in towns and campuses | Public idea |
| 19 | `home-bakery-uganda` | Home bakery (cakes, bread, mandazi) | Food | `500k_2m` | 500k–2M (oven, mixer) | Women, home‑based entrepreneurs | Public idea |
| 20 | `snack-and-chips-stall-uganda` | Snack & chips stall (fries, samosas, chapati chips) | Food | `under_500k` | Under 500k | Youth near schools and stages | Public idea |
| 21 | `grilled-meat-and-barbeque-point-uganda` | Grilled meat (muchomo) & barbeque point | Food | `500k_2m` | 500k–2M | Youth in trading centers and bars | Public idea |
| 22 | `mobile-food-delivery-uganda` | Mobile food delivery (office lunch packs) | Food | `under_500k` | Under 500k–1M (cooking equipment + packaging) | Youth with a motorcycle or boda partner | Public idea |
| 23 | `small-restaurant-kibanda-specializing-in-one-niche-uganda` | Small restaurant / kibanda specializing in one niche (e.g., katogo, luwombo) | Food | `above_2m` | Above 2M | Experienced cooks | Public idea |
| 24 | `street-tea-and-breakfast-kiosk-uganda` | Street tea and breakfast kiosk (chapati + tea + boiled eggs) | Food | `under_500k` | Under 500k | Youth and women | Public idea |
| 25 | `small-scale-food-processing-uganda` | Small-scale food processing (peanut butter, flour, juice concentrates) | Food | `500k_2m` | 500k–2M | Farmers, youth in crop‑rich regions | Public idea |
| 26 | `mobile-money-and-agency-banking-point-uganda` | Mobile money & agency banking point | Retail | `500k_2m` | 500k–2M (float, kiosk) | Youth, women in busy centers | Public idea |
| 27 | `phone-accessories-and-small-electronics-shop-uganda` | Phone accessories and small electronics shop | Retail | `500k_2m` | 500k–2M | Youth in trading centers | Public idea |
| 28 | `second-hand-clothes-stall-uganda` | Second-hand clothes (mitumba) stall | Retail | `under_500k` | Under 500k–1.5M | Youth and women in markets | Public idea |
| 29 | `cosmetics-and-beauty-products-mini-shop-uganda` | Cosmetics & beauty products mini-shop | Retail | `500k_2m` | 500k–2M | Women in urban areas | Public idea |
| 30 | `motorcycle-spare-parts-shop-uganda` | Motorcycle spare parts shop | Retail | `above_2m` | Above 2M (stock + small space) | People near busy stages or garages | Public idea |
| 31 | `small-hardware-construction-materials-outlet-uganda` | Small hardware / construction materials outlet | Retail | `above_2m` | Above 2M | Town trading centers | Public idea |
| 32 | `stationery-and-printing-kiosk-uganda` | Stationery & printing kiosk (photocopy, printing, laminating) | Retail | `500k_2m` | 500k–2M (printer, small copier) | Youth near schools/universities | Public idea |
| 33 | `general-merchandise-duka-uganda` | General merchandise duka (sugar, soap, salt, etc.) | Retail | `500k_2m` | 500k–2M | Families in residential areas | Public idea |
| 34 | `salon-and-beauty-services-uganda` | Salon and beauty services (hair, nails, makeup) | Services | `500k_2m` | 500k–2M | Women and youth with beauty skills | Public idea |
| 35 | `barber-shop-uganda` | Barber shop | Services | `under_500k` | Under 500k–1M | Youth in towns and trading centers | Public idea |
| 36 | `cleaning-services-uganda` | Cleaning services (homes, offices, events) | Services | `under_500k` | Under 500k–1.5M (basic tools) | Organized youth and women | Public idea |
| 37 | `event-planning-and-decoration-uganda` | Event planning & decoration | Services | `500k_2m` | 500k–2M (decor items, simple PA system) | Creative youth, women | Public idea |
| 38 | `photography-and-videography-uganda` | Photography & videography (events, portraits) | Services | `above_2m` | Above 2M (camera, basic editing laptop) | Tech‑savvy youth | Public idea |
| 39 | `motorcycle-repair-garage-uganda` | Motorcycle repair garage (boda maintenance) | Services | `under_500k` | Under 500k–1.5M (tool kit) | Skilled mechanics | Public idea |
| 40 | `mobile-car-wash-and-detailing-uganda` | Mobile car wash and detailing | Services | `under_500k` | Under 500k–1.5M (pressure washer, detergents) | Youth near affluent neighborhoods | Public idea |
| 41 | `welding-and-metal-fabrication-uganda` | Welding & metal fabrication (doors, windows, grills) | Services | `above_2m` | Above 2M (welding machine, tools) | Vocationally trained youth | Public idea |
| 42 | `tailoring-and-fashion-design-uganda` | Tailoring and fashion design (local outfits, uniforms) | Services | `under_500k` | Under 500k–1.5M (sewing machine) | Women, creative youth | Public idea |
| 43 | `daycare-creche-and-babysitting-service-uganda` | Daycare/creche and babysitting service | Services | `500k_2m` | 500k–2M | Women in urban residential areas | Public idea |
| 44 | `tuition-holiday-coaching-and-skills-training-uganda` | Tuition/holiday coaching and skills training | Services | `under_500k` | Under 500k (space + materials) | Teachers, graduates | Public idea |
| 45 | `online-store-uganda` | Online store (Jumia, social media shop, or own site) | Digital | `500k_2m` | 500k–2M (stock, branding, basic site) | Youth comfortable with online tools | Public idea |
| 46 | `social-media-marketing-and-content-services-for-smes-uganda` | Social media marketing & content services for SMEs | Digital | `under_500k` | Under 500k (smartphone + data) | Youth who know TikTok/Instagram/Facebook | Public idea |
| 47 | `youtube-tiktok-channel-about-ugandan-business-ideas-farming-or-side-hustles-uganda` | YouTube/TikTok channel about Ugandan business ideas, farming, or side hustles | Digital | `under_500k` | Under 500k–1M | Confident, consistent content creators | Public idea |
| 48 | `freelance-graphic-design-and-branding-uganda` | Freelance graphic design and branding (logos, posters, menus) | Digital | `500k_2m` | 500k–2M (laptop, software) | Creative youth | Public idea |
| 49 | `basic-it-training-small-cyber-caf-uganda` | Basic IT training / small cyber café (internet, printing, online forms) | Digital | `above_2m` | Above 2M (computers, internet) | Tech‑inclined youth in towns | Public idea |
| 50 | `local-travel-and-tours-targeting-domestic-and-diaspora-visitors-uganda` | Local travel & tours targeting domestic and diaspora visitors | Digital | `500k_2m` | 500k–2M (marketing, partnerships; vehicles can be hired) | Youth with strong communication & networks | Public idea |
| 51 | `niche-blog-website-around-uganda-business-ideas-and-opportunities-uganda` | Niche blog/website around Uganda business ideas & opportunities | Digital | `under_500k` | Under 500k (domain, hosting) | Writers and researchers | Internal strategy |

---

## 7. Phase-by-Phase Implementation Plan

## Phase 0 — Project Audit

### Goal

Understand the current codebase before editing.

### Codex Must Check

| Area | What to Find |
|---|---|
| Routes | Current `app/` pages and dynamic routes |
| Data | Current `ideas.ts` structure |
| Components | Existing cards, filters, layout, nav |
| SEO | `metadata`, `sitemap.ts`, `robots.ts`, Open Graph |
| Styling | Tailwind config, global CSS, spacing patterns |
| Deployment | Vercel config, env usage |
| Build health | Current TypeScript and lint errors |

### Output Required

Codex must produce:

1. Current folder structure summary.
2. Current route map.
3. Current data model summary.
4. Missing files list.
5. Smallest safe implementation plan.
6. Approval request before edits.

---

## Phase 1 — Dynamic Idea Pages + SEO Foundation

### Goal

Turn UBI from a static list into a search-indexable idea library.

### Tasks

| Task | File/Area |
|---|---|
| Normalize idea data | `data/ideas.ts` |
| Add slug utility | `lib/slug.ts` |
| Add `/ideas` listing page if missing | `app/ideas/page.tsx` |
| Add dynamic idea route | `app/ideas/[slug]/page.tsx` |
| Add `generateStaticParams` | dynamic route |
| Add `generateMetadata` | dynamic route |
| Add 404 handling | `notFound()` |
| Add related ideas | idea detail page |
| Add visible FAQ section | idea detail page |
| Add internal links | category, budget, suppliers, guides |

### SEO Metadata Pattern

Each idea page should generate:

| Metadata Field | Example |
|---|---|
| Title | `How to Start Poultry Farming in Uganda | UBI` |
| Description | `Startup costs, risks, suppliers, and step-by-step guidance for poultry farming in Uganda.` |
| Canonical | `/ideas/poultry-farming-uganda` |
| Open Graph title | Same or shorter |
| Keywords | Use carefully; do not stuff keywords |

### Page Content Pattern

Each idea page should include:

1. Hero summary.
2. Capital range.
3. Best for.
4. Skills needed.
5. Step-by-step startup checklist.
6. Where to buy inputs.
7. Supplier cards.
8. Risks and how to reduce them.
9. Estimated profit potential with clear disclaimer.
10. FAQs.
11. WhatsApp CTA.
12. Related ideas.

### Definition of Done

| Check | Expected Result |
|---|---|
| Invalid slug | Shows 404 |
| Every public idea | Has a page |
| Metadata | Unique per page |
| Mobile layout | Works at 360px width |
| Internal links | No dead links |
| Build | `npm run build` passes |

---

## Phase 2 — Supplier Cards + WhatsApp Lead Capture

### Goal

Create the first monetization surface.

### Tasks

| Task | File/Area |
|---|---|
| Add supplier data | `data/suppliers.ts` |
| Add supplier card component | `components/SupplierCard.tsx` |
| Add supplier cards to idea pages | `app/ideas/[slug]/page.tsx` |
| Add WhatsApp CTA helper | `lib/whatsapp.ts` |
| Add reusable CTA component | `components/WhatsAppCTA.tsx` |
| Add `/suppliers` page | `app/suppliers/page.tsx` |
| Add `/advertise` page | `app/advertise/page.tsx` |

### Supplier Data Rules

Codex must not invent phone numbers.

Use:

```ts
contactStatus: "needs_verification"
```

until the owner adds real contacts.

### WhatsApp CTA Examples

| CTA Location | CTA Text |
|---|---|
| Idea page | `I want help starting this business` |
| Supplier card | `Contact supplier on WhatsApp` |
| Guide page | `Buy this guide on WhatsApp` |
| Advertise page | `List my business on UBI` |

### WhatsApp Message Template

```text
Hello UBI, I want help with {ideaTitle}. My budget is {budgetRange}. Please guide me.
```

### Definition of Done

| Check | Expected Result |
|---|---|
| Supplier card | Shows name, location, category, status |
| WhatsApp link | Opens correct message |
| Advertise page | Shows packages and CTA |
| No fake contacts | Placeholder contacts clearly marked |
| Mobile | CTA buttons are easy to tap |

---

## Phase 3 — Guides System

### Goal

Create simple paid products before building complex subscriptions.

### First 3 Guides

| Guide | Suggested Price | Why |
|---|---:|---|
| Start Poultry Farming in Uganda | 20,000 UGX | Strong demand, connects to Farm Beacon knowledge |
| 25 Businesses You Can Start Under 500k UGX | 15,000 UGX | Good for youth and students |
| Where to Buy Business Inputs in Kampala | 20,000 UGX | Strong supplier monetization link |

### Tasks

| Task | File/Area |
|---|---|
| Add guide data | `data/guides.ts` |
| Add `/guides` page | `app/guides/page.tsx` |
| Add guide detail pages | `app/guides/[slug]/page.tsx` |
| Add guide CTAs to relevant idea pages | idea detail page |
| Add manual payment instructions | guide page |
| Add WhatsApp receipt flow | guide page |

### Manual Payment Flow

Do not integrate online payment first.

Start with:

1. User clicks `Buy guide`.
2. WhatsApp opens with guide name.
3. Owner sends Mobile Money number.
4. User sends payment screenshot.
5. Owner sends PDF manually.
6. Track sales in Google Sheet.

### Definition of Done

| Check | Expected Result |
|---|---|
| `/guides` page | Shows 3 guides |
| Guide page | Has price, summary, what user gets |
| WhatsApp buy link | Includes guide title |
| Related idea links | Present |
| No payment API | Keep manual for phase 1 |

---

## Phase 4 — Blog + SEO Content Clusters

### Goal

Create weekly content that targets local search and AI answers.

### First Blog Topics

| Cluster | Post Title |
|---|---|
| Budget | Best Businesses to Start With 500k UGX in Uganda |
| Youth | Best Side Hustles for Youth in Uganda |
| Agriculture | Best Farming Businesses in Uganda |
| Women | Business Ideas for Women and Mothers in Uganda |
| Kampala sourcing | Where to Buy Business Inputs in Kikuubo |
| Food | How to Start a Chapati/Rollex Business |
| Retail | Small Retail Businesses That Work in Uganda |

### Tasks

| Task | File/Area |
|---|---|
| Add blog data | `data/blogPosts.ts` |
| Add blog listing | `app/blog/page.tsx` |
| Add blog detail route | `app/blog/[slug]/page.tsx` |
| Add internal links to ideas | blog pages |
| Add related guides | blog pages |
| Add author/review date | blog pages |

### Content Rules

| Rule | Instruction |
|---|---|
| Be local | Mention Uganda, Kampala, Kikuubo, Owino, local markets where relevant. |
| Be realistic | Use estimates and disclaimers. No guaranteed profit claims. |
| Be helpful | Include steps, costs, risks, and where to buy. |
| Be structured | Use headings, FAQs, tables, and checklists. |
| Be updated | Include `lastReviewed`. |

---

## Phase 5 — Analytics + Search Console Readiness

### Goal

Know which ideas users want and which pages attract traffic.

### Events to Track

| Event Name | Trigger |
|---|---|
| `idea_view` | User opens idea page |
| `filter_used` | User filters by category or budget |
| `supplier_click` | User clicks supplier CTA |
| `whatsapp_click` | User clicks WhatsApp CTA |
| `guide_cta_click` | User clicks guide CTA |
| `advertise_cta_click` | Supplier clicks advertise CTA |
| `lead_form_submit` | User submits form |

### Recommended Implementation

Create:

```text
lib/analytics.ts
```

with safe no-op behavior if GA is not configured.

Use environment variable:

```text
NEXT_PUBLIC_GA_MEASUREMENT_ID
```

If missing, analytics should not break the app.

### Search Console Tasks

| Task | Owner |
|---|---|
| Verify domain | Owner |
| Submit sitemap | Owner |
| Inspect top pages | Owner |
| Track queries | Owner + Codex later |

---

## Phase 6 — Sitemap, Robots, and Structured Data

### Goal

Help search engines discover pages and understand the site.

### Required Files

| File | Purpose |
|---|---|
| `app/sitemap.ts` | Include homepage, ideas, categories, budgets, guides, blog |
| `app/robots.ts` | Allow crawling and reference sitemap |
| `components/SeoJsonLd.tsx` | Reusable JSON-LD renderer |
| `lib/seo.ts` | SEO title and description helpers |

### JSON-LD Types to Use

Use only honest structured data:

| Page | JSON-LD |
|---|---|
| Homepage | `WebSite`, `Organization` |
| Idea page | `Article`, `BreadcrumbList` |
| Blog page | `Article`, `BreadcrumbList` |
| Guide page | `Product` only if the guide is truly sold |
| Supplier page | `LocalBusiness` only for verified suppliers |

### Important Rule

Do not add fake `Review`, fake rating, fake price, or fake availability schema.

Visible FAQs are good for users, but do not depend on FAQ rich results as the main SEO tactic.

---

## 8. Monetization Pages

## 8.1 `/advertise` Page Content

Use this structure:

1. Hero: `Reach Ugandans looking for business ideas and suppliers`
2. Who can advertise:
   - Agro-input shops
   - Feed suppliers
   - Equipment sellers
   - Printing/cyber services
   - Training providers
   - Market vendors and wholesalers
3. Packages:
   - Starter
   - Standard
   - Featured
4. What supplier gets:
   - Supplier card
   - Category listing
   - Idea page placement
   - WhatsApp lead link
5. CTA:
   - `List my business on UBI`

### Suggested Package Table

| Package | Price | Includes |
|---|---:|---|
| Starter | 50,000 UGX/month | Supplier card on one relevant idea page |
| Standard | 100,000 UGX/month | Supplier card on category page + 3 idea pages |
| Featured | 200,000 UGX/month | Homepage feature + category page + 5 idea pages |

Use these as placeholders. Make them easy to update.

---

## 8.2 `/start-here` Page

This page should help beginners choose fast.

Recommended questions:

1. What is your budget?
2. Where are you located?
3. Do you prefer farming, food, retail, services, or online?
4. Do you have land?
5. Do you want daily cashflow or long-term investment?

For now, this can be a static quiz/filter. AI comes later.

---

## 9. UI/UX Rules

### 9.1 Mobile First

Uganda users will mostly use phones. Build for:

| Screen | Requirement |
|---|---|
| 360px width | No horizontal scroll |
| Low data | Avoid heavy images |
| Slow network | Keep pages lightweight |
| Touch | Buttons must be large |
| WhatsApp | Main action path |

### 9.2 Card Design

Idea cards should show:

1. Title
2. Category
3. Budget band
4. Best for
5. Risk level
6. `View idea` button
7. `Get help` CTA

### 9.3 Idea Detail Design

Use a simple structure:

```text
Hero
Quick facts
Startup checklist
Capital breakdown
Where to buy
Supplier cards
Risks
Profit potential
FAQs
Related ideas
CTA
```

---

## 10. Compliance and Trust Rules

UBI must sound trustworthy.

### 10.1 Avoid These Claims

Do not say:

- `Guaranteed profit`
- `You will earn X`
- `This business cannot fail`
- `Verified supplier` unless verified
- `Official investment advice`

### 10.2 Use These Safer Phrases

Use:

- `Estimated startup capital`
- `Possible profit range`
- `Depends on location, pricing, and execution`
- `Supplier contact needs verification`
- `Use this as a planning guide, not financial advice`

### 10.3 Add Site Trust Pages Later

| Page | Purpose |
|---|---|
| `/about` | Who runs UBI |
| `/contact` | Contact and WhatsApp |
| `/privacy` | Lead capture and analytics transparency |
| `/terms` | Disclaimers and user responsibilities |

---

## 11. Environment Variables

Codex should document any env vars it adds.

Recommended:

```env
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_WHATSAPP_NUMBER=256XXXXXXXXX
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_LEAD_FORM_URL=https://forms.gle/...
```

If values are missing, the app should still build.

---

## 12. Acceptance Tests

Codex must run and report these where applicable.

```bash
npm run lint
npm run build
```

If no lint script exists, report that clearly.

### Manual Tests

| Test | Steps | Expected |
|---|---|---|
| Ideas listing | Open `/ideas` | All public ideas appear |
| Idea detail | Open `/ideas/poultry-farming-uganda` | Page loads with details |
| Invalid idea | Open `/ideas/fake-idea` | 404 appears |
| Category page | Open `/categories/agriculture` | Agriculture ideas show |
| Budget page | Open `/budget/under-500k` | Matching ideas show |
| Guides page | Open `/guides` | 3 guides appear |
| Advertise page | Open `/advertise` | Packages and CTA appear |
| WhatsApp CTA | Click CTA | Opens WhatsApp link |
| Sitemap | Open `/sitemap.xml` | Includes dynamic pages |
| Mobile | Test 360px width | No layout break |

---

## 13. Suggested Git Workflow

Codex should use small commits if allowed by owner.

```bash
git status
git checkout -b ubi-income-foundation
```

Suggested commit sequence:

1. `feat: add normalized idea data and slug helpers`
2. `feat: add dynamic idea pages with metadata`
3. `feat: add supplier cards and whatsapp ctas`
4. `feat: add guides and advertise pages`
5. `feat: add blog pages and sitemap entries`
6. `chore: add analytics event helpers`

Do not commit secrets.

---

## 14. Priority Order for Codex

This is the exact order to work.

| Priority | Work |
|---:|---|
| 1 | Audit project read-only |
| 2 | Normalize 50 public ideas |
| 3 | Add dynamic idea pages |
| 4 | Add SEO metadata and sitemap |
| 5 | Add supplier cards |
| 6 | Add WhatsApp CTAs |
| 7 | Add `/advertise` page |
| 8 | Add `/guides` page and 3 guide pages |
| 9 | Add `/blog` and first 7 posts |
| 10 | Add analytics helper |
| 11 | Run build and fix errors |
| 12 | Report completed files and next actions |

---

## 15. Deliverables Codex Must Return

After implementation, Codex must report:

1. Files created.
2. Files modified.
3. Routes added.
4. Data model changes.
5. Build/lint results.
6. Manual test results.
7. Remaining risks.
8. Next recommended phase.

---

## 16. External Research Notes Used

These references support the implementation direction.

| Topic | Source |
|---|---|
| Uganda digital/mobile context | DataReportal Digital 2026 Uganda |
| Uganda mobile internet, mobile money, smartphones | Uganda Communications Commission market updates |
| SEO basics and helpful content | Google Search Central |
| Sitemaps | Google Search Central Sitemap docs |
| Structured data | Google Search Central Structured Data docs |
| Next.js metadata and dynamic routes | Next.js official docs |
| JSON-LD in Next.js | Next.js official JSON-LD guide |

### Strategic Interpretation

1. Uganda is strongly mobile-first, so WhatsApp-first conversion is more realistic than complex account flows.
2. SEO pages should target local long-tail searches like `businesses under 500k in Uganda`.
3. Supplier monetization can start manually before payment automation.
4. AI recommendations should wait until there is enough site behavior data.
5. Database migration should wait until static content becomes painful to maintain.

---

# Final Instruction to Codex

Start with a read-only audit. Then implement the smallest safe version of:

> **50 idea pages + SEO metadata + sitemap + supplier cards + WhatsApp CTAs + guides + advertise page.**

Do not build advanced AI, user accounts, mobile app, or full database migration until revenue features are live and tested.
