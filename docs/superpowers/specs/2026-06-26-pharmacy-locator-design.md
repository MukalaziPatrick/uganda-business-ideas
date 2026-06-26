# Pharmacy Locator Vertical — Design

**Date:** 2026-06-26
**App:** Business Yoo (`uganda-business-ideas`)
**Route:** `/pharmacy`
**Status:** Approved, ready for implementation plan

---

## 1. Summary

A **"Find a Licensed Pharmacy"** directory at `/pharmacy`, listed in the `/apps`
holding area (not the homepage — homepage freeze respected). It follows the
existing Business Yoo vertical pattern (laundry / salons / travel): one
server-rendered page reading a Supabase table, rendering a card grid of
verified pharmacies with **click-to-call / WhatsApp** contact only.

This is a **locator, not an e-pharmacy**. The scope is deliberately constrained
by Uganda's drug-regulation reality (see §2).

---

## 2. Regulatory basis (why scope is what it is)

Research (NDA / PSU / Ministry of Health Uganda, plus the 2025 National Drug and
Health Products Authority Bill) established:

- Uganda has **no fully-enforced "online pharmacy" framework yet**, but the NDA
  already regulates pharmacy licensing **and all drug-related advertising in any
  medium, including internet and social media** (S.I. 33 of 2014 + NDA 2017
  guidelines). Penalties under the new 2025 Bill reach UGX 400M / 15 years for
  individuals and up to UGX 3B for companies for unapproved drug advertising.
- A **directory of facility-level pharmacy info** (name, location, contacts) is
  low-risk. The moment you list **drug names, prices, stock levels, discounts, or
  enable ordering/payment**, you enter regulated drug-advertising / drug-supply
  territory and risk being treated as operating an unlicensed pharmacy.
- Online/broadcast **platforms themselves can be sanctioned** (UCC has ordered
  takedowns) for hosting unapproved drug adverts, even when a third party supplies
  the product.

### Hard compliance boundaries (baked into this design)

- ❌ No drug names, dosages, or indications
- ❌ No prices, no "in stock / out of stock", no discounts or promotions
- ❌ No in-app ordering, cart, or payment
- ❌ No free-text "promise"/marketing field a pharmacy could fill with drug claims
- ✅ Facility info + contact links only — ordering happens 1:1, off-platform,
  under the pharmacy's own licence
- ✅ Visible disclaimer: *"This is an informational directory. Business Yoo does
  not sell or dispense medicines. We list licensed pharmacies only."*
- ✅ Store NDA licence number + expiry so lapsed pharmacies auto-hide

---

## 3. Architecture

Mirrors the existing vertical pattern exactly:

- **Page:** `app/pharmacy/page.tsx` — server component, `export const revalidate = 60`
- **Data:** new Supabase table `pharmacy_businesses`, read with the anon key
- **Public query:** `status IN ('active','featured')`
  **AND** (`licence_expiry IS NULL OR licence_expiry >= today`), featured first,
  limit 20
- **Admin:** `app/api/admin/pharmacy/{approve,feature,reject}/route.ts`, gated by
  the existing `admin_token` cookie check (same as salons)
- **Directory entry:** add one object to `BASE_APPS` in `app/apps/page.tsx`
- **Homepage / main nav:** untouched (freeze)

---

## 4. Data model

```typescript
// lib/supabase/pharmacy-types.ts
interface PharmacyBusiness {
  id: string;
  slug: string;
  name: string;

  // Location
  region: string | null;        // e.g. "Central"
  district: string | null;      // e.g. "Kampala"
  service_area: string | null;  // e.g. "Nansana, Wakiso"
  address: string | null;       // physical address (facility info — allowed)

  // Contact (the only "action" — off-platform)
  whatsapp: string;             // required, click-to-WhatsApp
  phone: string | null;         // click-to-call

  // Facility info (NO drug names / prices / stock)
  hours: string | null;                    // e.g. "Mon–Sat 8am–9pm"
  is_24_hour: boolean;                     // service tag
  has_delivery: boolean;                   // service tag ("Delivery available")
  supervising_pharmacist: string | null;   // PSU-registered name (optional)

  // Compliance / verification
  nda_licence_no: string | null;   // shown as trust signal ("NDA Licensed · #XXXX")
  licence_expiry: string | null;   // date — auto-hides lapsed pharmacies

  // Lifecycle
  status: 'pending' | 'active' | 'featured';
  created_at: string;
}
```

**Key decisions:**

1. **`licence_expiry` drives auto-hide.** A lapsed licence drops the pharmacy from
   the directory automatically — no manual cleanup, keeps us to "licensed outlets
   only."
2. **No `momo_code`, `app_url`, or `promise`** (laundry had these). The free-text
   `promise` is deliberately omitted — it's where drug claims/ads could leak in.
   Service info is constrained to structured boolean tags + hours.
3. **`nda_licence_no` shown** as a trust badge — directly addresses the documented
   user gap (can't tell which online pharmacies are legit).
4. **RLS:** public anon read on active/featured rows only; writes via service-role
   (admin) only — same as other verticals.

---

## 5. Public page UI (`app/pharmacy/page.tsx`)

- **Header:** "Find a Licensed Pharmacy" + subtitle "Verified, NDA-licensed
  pharmacies near you."
- **Compliance banner** (static): *"This is an informational directory. Business
  Yoo does not sell or dispense medicines. We list licensed pharmacies only — for
  prescriptions and orders, contact the pharmacy directly."*
- **Card grid**, each card:
  - Name + **"✓ NDA Licensed · #{nda_licence_no}"** badge (only if licence present
    & valid)
  - District / service area
  - Hours + tags: 🕐 24-Hour, 🛵 Delivery available (only true booleans shown)
  - Supervising pharmacist line (if present)
  - Buttons: **💬 WhatsApp** (`https://wa.me/...`) and **📞 Call** (`tel:`)
- **Empty state:** "We're verifying pharmacies in your area. Check back soon."
- **Query:** as in §3 (active/featured + valid licence, featured first, limit 20)

---

## 6. Admin (`app/api/admin/pharmacy/`)

Copy the salons pattern exactly:

- `approve/route.ts` → `status = 'active'`
- `feature/route.ts` → `status = 'featured'`
- `reject/route.ts`  → `status = 'pending'`

All gated by the existing `admin_token` cookie check.

---

## 7. `/apps` directory entry

Add to `BASE_APPS` in `app/apps/page.tsx`:

```typescript
{ href: '/pharmacy', emoji: '💊', name: 'Find a Pharmacy',
  tagline: 'Licensed pharmacies near you', color: '#DC2626', bg: '#FEE2E2' }
```

---

## 8. Seeding

v1 ships with a handful of **real, verified-licensed** Kampala pharmacies entered
manually (`status = 'active'`) — **not demo data** — sourced from NDA / PSU public
lists. Each NDA licence number must be confirmed before going live. Placeholders
flagged in the seed migration for Patrick to confirm.

---

## 9. Testing

Vitest unit test on the public query filter:

- A row with `licence_expiry` in the past is **excluded**
- A `pending` row is **excluded**
- An `active` row with a valid (or null) licence is **included**

---

## 10. Out of scope (explicitly deferred)

These require the National Drug and Health Products Act to be operational and
NDA's draft online-pharmacy guidelines to be issued before they can be revisited:

- Drug/product listings, prices, stock levels
- In-app ordering, cart, checkout, payment (Pesapal / MoMo)
- Prescription upload + pharmacist verification flow
- Discounts / promotions

If pursued later, follow a MyDawa-style model: attach to licensed pharmacies, keep
OTC and prescription baskets strictly separate, require prescription upload +
pharmacist verification, and seek NDA vetting for any drug-related content.
