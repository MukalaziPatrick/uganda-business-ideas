# Business Yoo MVP From Research

Date: 2026-07-04
Source report: `east-africa-business-intelligence-research.md`

## Decision

Build **Tender Alerts + Supplier/Lead Hub** first.

Business Yoo can become an East Africa business operating system later, but the first useful product must be narrow enough to sell quickly. The first wedge is not a big multi-country platform. It is a simple paid workflow:

> Find relevant tenders and supplier opportunities, summarize them, and send them to the right Ugandan businesses by WhatsApp/email.

## Why This Comes First

- Tenders have urgent money attached to them.
- Contractors, suppliers, consultants, schools, clinics, NGOs, and SMEs already understand the value of new opportunities.
- The first version can be manual or semi-manual before automation is perfect.
- Uganda is the home base, but Kenya can be added second because it has strong tender volume.
- The same database later becomes a supplier directory, lead engine, market map, and agency prospecting tool.

## Build First

1. **Tender board**
   - A `/tenders` page with active tenders.
   - Fields: title, country, category, procuring entity, deadline, source, summary, status.
   - Add source links and clear freshness dates.

2. **Tender alert signup**
   - Capture name, business, WhatsApp, email, country, categories, and keywords.
   - First offer: UGX 50,000/month for matched alerts.

3. **Supplier/lead seed database**
   - Use `data/east-africa-business-categories.csv` as the category map.
   - Start with Kampala, Wakiso, Jinja, Mbarara, Gulu, and Arua.
   - Prioritize construction, general supplies, hardware/building materials, solar, commercial cleaning, security, ICT, and agro-inputs.

4. **Manual outreach tracker**
   - Track 10-20 prospects before building more software.
   - Record business name, sector, contact, first message date, reply, next action, and payment status.

## Do Not Build Yet

- Full East Africa OS.
- Mobile app.
- User accounts.
- Self-serve billing.
- All-country scraping.
- Complex dashboards.
- Automated WhatsApp API.
- Land registry scraping, OTP portals, login-protected registries, or captcha bypasses.

## Data Files Created

- `data/east-africa-business-categories.csv`
  - Import-safe category database for Google Sheets or Supabase.
- `data/priority-cities.csv`
  - City priority list, Uganda first.
- `data/priority-sources.csv`
  - Data source inventory for tenders, suppliers, registries, NGO opportunities, and market data.

## First Paid Offer

Use this message for contractors, suppliers, and service firms:

```text
Hi [Name], I am testing Business Yoo Tender Radar.

It checks public tender and opportunity sources and sends businesses only the tenders that match their sector, with deadlines and requirements summarized.

I am starting with a small group of Ugandan businesses. First week is free, then UGX 50,000/month if it saves you time or helps you find useful opportunities.

Which sectors should I track for you?
```

## First 7 Days

### Day 1: Prepare The Database

- Import `data/east-africa-business-categories.csv` into Google Sheets.
- Import `data/priority-cities.csv`.
- Import `data/priority-sources.csv`.
- Mark every seed row as unverified unless personally checked.

Output: a working research spreadsheet.

### Day 2: Pick The First 3 Categories

Start with:

- General suppliers and procurement vendors.
- Construction and contractors.
- Hardware/building materials or solar installers.

Output: a short target list and clear outreach angle.

### Day 3: Collect First Tenders

- Find 10-20 current tenders from PPDA, UNGM, ReliefWeb, and trusted newspaper/source checks.
- Capture title, source, deadline, category, entity, and link.

Output: a simple tender board dataset.

### Day 4: Create Or Finish `/tenders`

- Use the existing Next.js app.
- Show active tenders with category filters and a subscribe CTA.
- Do not wait for perfect automation.

Output: a live page or local page ready to deploy.

### Day 5: Build Prospect List

- Collect 10-20 businesses that may pay for alerts.
- Prioritize businesses already bidding or supplying government/NGO buyers.

Output: prospect tracker.

### Day 6: Send First Messages

- Send the first free-week offer to 10 prospects.
- Ask which sectors to track.
- Log replies.

Output: validation conversations.

### Day 7: Review

Answer honestly:

- Did anyone ask to be added?
- Did anyone say they already pay for this?
- Did anyone mention a better source or category?
- What would make this worth UGX 50,000/month?

Output: next-week decision.

## Success Gate

Continue building the tender product if at least one of these happens in the first 14 days:

- 3 businesses agree to receive alerts.
- 1 business pays or promises to pay after trial.
- 5 businesses give useful category/source preferences.
- A bid writer, contractor, or supplier asks for a custom digest.

Pause and rethink if everyone says free WhatsApp groups or newspapers are enough.

## Next Technical Step

Before writing new code, inspect the existing `tenders-site-page` worktree. If it already has the tender UI, merge or copy that work instead of rebuilding.

Then make the smallest live slice:

- `/tenders`
- `Subscribe for alerts`
- 10-20 real tender rows
- WhatsApp/contact CTA
- clear source attribution
