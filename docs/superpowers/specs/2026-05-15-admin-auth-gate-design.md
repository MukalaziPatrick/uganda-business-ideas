# Admin Auth Gate — Design Spec (2026-05-15)

## Goal

Protect all `/admin/*` routes so only the single admin user (Patrick) can access them. Anyone without a valid session is redirected to a login page.

## Scope

- One admin account (created manually in Supabase Auth dashboard)
- Email + password login
- Session managed by Supabase Auth cookies
- All `/admin/*` routes protected automatically via Next.js middleware

## Architecture

Next.js middleware (`middleware.ts` at project root) intercepts every request to `/admin/*`. It reads the Supabase session from cookies. If no valid session exists, it redirects to `/admin/login?next=<original-url>`. After successful login, the user is sent back to the original URL.

## Files

| File | Status | Purpose |
|------|--------|---------|
| `middleware.ts` | New | Intercepts `/admin/*`, checks session, redirects if missing |
| `app/admin/login/page.tsx` | New | Email + password login form |
| `app/api/auth/login/route.ts` | New | POST handler — Supabase sign-in, sets cookie, redirects |
| `app/admin/leads/page.tsx` | No change | Already works; middleware protects it |

## Data Flow

1. User visits `/admin/leads`
2. Middleware checks for Supabase session cookie — not found
3. Middleware redirects to `/admin/login?next=/admin/leads`
4. User submits email + password
5. POST to `/api/auth/login`
6. Server calls `supabase.auth.signInWithPassword()`
7. On success: session cookie set, redirect to `next` param (`/admin/leads`)
8. Middleware runs again — session valid → page loads

## Error Handling

- Wrong credentials → login page shows "Invalid email or password"
- Supabase unavailable → login page shows "Something went wrong, try again"
- Session expires → middleware redirects to login automatically

## Supabase Auth Setup (manual step before deploy)

1. In Supabase dashboard → Authentication → Users → Invite user
2. Enter patricktwin1@gmail.com and set a password
3. No email confirmation needed (disable in Auth settings if required)

## Security Notes

- Service role key is NOT used for auth — only `anon` key with Supabase Auth
- Session cookie is httpOnly, set by Supabase client
- The `next` redirect param is validated to only allow relative paths (no open redirect)

## Future Compatibility

Because protection lives in middleware, any new `/admin/*` page added later (e.g. `/admin/jobs`) is automatically protected with zero extra code.
