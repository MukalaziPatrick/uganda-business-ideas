# Handoff: Admin Auth Gate

**Date:** 2026-05-15  
**Branch:** `worktree-admin-auth-gate`  
**Worktree:** `.claude/worktrees/admin-auth-gate`  
**Status:** Implementation complete, awaiting manual browser test + merge

---

## What Was Built

All `/admin/*` routes are now protected behind Supabase Auth email+password login. Unauthenticated visitors are redirected to `/admin/login?next=<original-url>`. After login, they land on the page they were trying to reach.

## Files Created

| File | Purpose |
|------|---------|
| `lib/supabase/auth.ts` | Supabase client factory (anon key, no persistence) |
| `middleware.ts` | Intercepts `/admin/*`, checks `sb-access-token` cookie |
| `app/admin/login/page.tsx` | Email + password login form |
| `app/api/auth/login/route.ts` | POST: signs in, sets cookies, redirects |
| `app/api/auth/logout/route.ts` | POST: clears cookies, redirects to login |
| `app/admin/leads/page.tsx` | **Modified** — added Sign out button |

## Commits (7 total)

```
dd69d24 fix: harden login route — block protocol-relative redirect, guard null refresh_token, clamp maxAge
6135206 feat: sign out button on admin leads page
a90afd2 feat: admin login page
0880779 feat: middleware guards all /admin/* routes
c4a5e4f feat: admin logout API route
b0079c5 feat: admin login API route
c1bc7e6 feat: supabase auth client for server-side session checks
```

## Before Testing: One-Time Supabase Setup (if not done)

1. Supabase Dashboard → your `uganda-business-ideas` project
2. **Authentication → Users → Add user → Create new user**
   - Email: `patricktwin1@gmail.com`, set a strong password
3. **Authentication → Configuration → Auth → Email → disable "Confirm email"**
4. Save

## Manual E2E Test Checklist (Task 7 — not yet done)

Run `npm run dev` from the worktree, then:

- [ ] Visit `http://localhost:3000/admin/leads` → redirected to `/admin/login?next=/admin/leads`
- [ ] Enter wrong password → page reloads with "Invalid email or password."
- [ ] Enter correct credentials → redirected to `/admin/leads`, table visible
- [ ] Refresh `/admin/leads` → stays on page (session persists)
- [ ] Click Sign out → redirected to `/admin/login`
- [ ] Visit `/admin/leads` again → redirected to login

## Next Session: To Complete

1. Do the Supabase user setup above (if not done)
2. Run `npm run dev` from `.claude/worktrees/admin-auth-gate`
3. Complete the manual test checklist
4. Choose merge option:
   - **Option 1:** `git checkout master && git merge worktree-admin-auth-gate` (local merge)
   - **Option 2:** `git push -u origin worktree-admin-auth-gate` + open PR

## Known Notes

- Middleware checks cookie **presence** only (not JWT validity) — acceptable trade-off for a single-admin app at the edge
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` must be set in `.env.local` (already present from prior work)
- When deploying to Vercel, add these same env vars in the Vercel dashboard
