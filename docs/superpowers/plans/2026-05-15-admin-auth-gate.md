# Admin Auth Gate Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Protect all `/admin/*` routes behind a Supabase Auth email+password login so only the admin user can access them.

**Architecture:** Next.js middleware reads the Supabase session cookie on every `/admin/*` request and redirects unauthenticated visitors to `/admin/login?next=<original-url>`. A login form POSTs to `/api/auth/login`, which calls Supabase Auth `signInWithPassword`, sets the session cookie, and redirects to the `next` URL.

**Tech Stack:** Next.js 16 (App Router), `@supabase/supabase-js` v2, Supabase Auth (email+password), server actions / Route Handlers

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `middleware.ts` | Create | Intercept `/admin/*`, check session, redirect if missing |
| `lib/supabase/auth.ts` | Create | Browser Supabase client for auth (uses anon key) |
| `app/admin/login/page.tsx` | Create | Email + password login form |
| `app/api/auth/login/route.ts` | Create | POST handler — sign in, set cookie, redirect |
| `app/api/auth/logout/route.ts` | Create | POST handler — sign out, clear cookie, redirect to login |

---

## Pre-Work: Create the Admin User in Supabase (manual, do once)

Before running the app, create your account in Supabase:

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard) → your `uganda-business-ideas` project
2. Left sidebar → **Authentication** → **Users**
3. Click **Add user** → **Create new user**
4. Email: `patricktwin1@gmail.com`, set a strong password
5. Left sidebar → **Authentication** → **Configuration** → **Auth**
6. Under **Email**, disable **Confirm email** (so you can log in immediately without clicking a link)
7. Save

---

## Task 1: Auth client for middleware and login route

**Files:**
- Create: `lib/supabase/auth.ts`

- [ ] **Step 1: Create `lib/supabase/auth.ts`**

This file exports a function that creates a Supabase client using only the anon key. It is used for auth operations (sign in, get session) — NOT for admin data queries.

```typescript
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export function createSupabaseAuthClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/supabase/auth.ts
git commit -m "feat: supabase auth client for server-side session checks"
```

---

## Task 2: Login API route

**Files:**
- Create: `app/api/auth/login/route.ts`

- [ ] **Step 1: Create `app/api/auth/login/route.ts`**

This route handles POST from the login form. It signs in with Supabase, sets the session cookie manually, and redirects. If credentials are wrong it redirects back to login with an error param.

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAuthClient } from "@/lib/supabase/auth";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");
  const next = formData.get("next");

  // Validate next param — only allow relative paths to prevent open redirect
  const redirectTo =
    typeof next === "string" && next.startsWith("/") ? next : "/admin/leads";

  if (typeof email !== "string" || typeof password !== "string") {
    return NextResponse.redirect(
      new URL(`/admin/login?error=invalid&next=${encodeURIComponent(redirectTo)}`, request.url)
    );
  }

  const supabase = createSupabaseAuthClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session) {
    const isCredentialsError =
      error?.message?.toLowerCase().includes("invalid") ||
      error?.message?.toLowerCase().includes("credentials");

    const errorCode = isCredentialsError ? "credentials" : "unknown";

    return NextResponse.redirect(
      new URL(
        `/admin/login?error=${errorCode}&next=${encodeURIComponent(redirectTo)}`,
        request.url
      )
    );
  }

  const response = NextResponse.redirect(new URL(redirectTo, request.url));

  // Set session cookies that middleware can read
  const { access_token, refresh_token, expires_at } = data.session;

  response.cookies.set("sb-access-token", access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
    maxAge: expires_at ? expires_at - Math.floor(Date.now() / 1000) : 3600,
  });

  response.cookies.set("sb-refresh-token", refresh_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return response;
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/auth/login/route.ts
git commit -m "feat: admin login API route"
```

---

## Task 3: Logout API route

**Files:**
- Create: `app/api/auth/logout/route.ts`

- [ ] **Step 1: Create `app/api/auth/logout/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/admin/login", request.url));

  response.cookies.delete("sb-access-token");
  response.cookies.delete("sb-refresh-token");

  return response;
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/auth/logout/route.ts
git commit -m "feat: admin logout API route"
```

---

## Task 4: Middleware

**Files:**
- Create: `middleware.ts` (project root, next to `package.json`)

- [ ] **Step 1: Create `middleware.ts`**

The middleware runs on every `/admin/*` request (except `/admin/login` itself). It checks for `sb-access-token` cookie. If missing, it redirects to the login page with the original URL as `next`.

```typescript
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /admin/* — but not /admin/login itself
  if (!pathname.startsWith("/admin") || pathname.startsWith("/admin/login")) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get("sb-access-token");

  if (!accessToken) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
```

- [ ] **Step 2: Commit**

```bash
git add middleware.ts
git commit -m "feat: middleware guards all /admin/* routes"
```

---

## Task 5: Login page

**Files:**
- Create: `app/admin/login/page.tsx`

- [ ] **Step 1: Create `app/admin/login/page.tsx`**

A plain server component with a form. Reads the `error` and `next` search params to show the right error message and pass `next` through to the API route.

```typescript
type LoginPageProps = {
  searchParams?: Promise<{
    error?: string;
    next?: string;
  }>;
};

export default async function AdminLoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const error = params?.error;
  const next = params?.next ?? "/admin/leads";

  function errorMessage(code: string | undefined) {
    if (code === "credentials") return "Invalid email or password.";
    if (code === "invalid") return "Please enter your email and password.";
    if (code === "unknown") return "Something went wrong. Try again.";
    return null;
  }

  const message = errorMessage(error);

  return (
    <main style={{ maxWidth: 360, margin: "80px auto", padding: "0 16px" }}>
      <h1 style={{ marginBottom: 24 }}>Admin Login</h1>
      {message && (
        <p style={{ color: "red", marginBottom: 16 }}>{message}</p>
      )}
      <form method="POST" action="/api/auth/login">
        <input type="hidden" name="next" value={next} />
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="email" style={{ display: "block", marginBottom: 4 }}>
            Email
          </label>
          <input
            id="email"
            type="email"
            name="email"
            required
            autoComplete="email"
            style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
          />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label htmlFor="password" style={{ display: "block", marginBottom: 4 }}>
            Password
          </label>
          <input
            id="password"
            type="password"
            name="password"
            required
            autoComplete="current-password"
            style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
          />
        </div>
        <button
          type="submit"
          style={{
            width: "100%",
            padding: "10px",
            background: "#1a1a1a",
            color: "#fff",
            border: "none",
            cursor: "pointer",
          }}
        >
          Sign in
        </button>
      </form>
    </main>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/admin/login/page.tsx
git commit -m "feat: admin login page"
```

---

## Task 6: Add logout button to leads page

**Files:**
- Modify: `app/admin/leads/page.tsx`

- [ ] **Step 1: Add logout form to the top of the leads page**

Open `app/admin/leads/page.tsx`. Find the `<main>` opening tag and add a logout form right after it, before the `<h1>`:

```typescript
// Add after <main> opening tag, before <h1>Leads</h1>
<form method="POST" action="/api/auth/logout" style={{ textAlign: "right", marginBottom: 16 }}>
  <button type="submit" style={{ padding: "6px 14px", cursor: "pointer" }}>
    Sign out
  </button>
</form>
```

The full `<main>` block should start like this:

```typescript
return (
  <main>
    <form method="POST" action="/api/auth/logout" style={{ textAlign: "right", marginBottom: 16 }}>
      <button type="submit" style={{ padding: "6px 14px", cursor: "pointer" }}>
        Sign out
      </button>
    </form>
    <h1>Leads</h1>
    {/* ... rest unchanged ... */}
  </main>
);
```

- [ ] **Step 2: Commit**

```bash
git add app/admin/leads/page.tsx
git commit -m "feat: sign out button on admin leads page"
```

---

## Task 7: Manual end-to-end test

No automated tests exist in this codebase — verify manually.

- [ ] **Step 1: Start the dev server**

```powershell
npm run dev
```

- [ ] **Step 2: Test unauthenticated redirect**

Open `http://localhost:3000/admin/leads` in the browser.

Expected: redirected to `http://localhost:3000/admin/login?next=/admin/leads`

- [ ] **Step 3: Test wrong password**

On the login page, enter any email and wrong password. Click Sign in.

Expected: page reloads with "Invalid email or password."

- [ ] **Step 4: Test successful login**

Enter `patricktwin1@gmail.com` and your Supabase Auth password. Click Sign in.

Expected: redirected to `/admin/leads`, leads table visible.

- [ ] **Step 5: Test session persists**

Refresh `/admin/leads`.

Expected: page loads without redirecting to login.

- [ ] **Step 6: Test logout**

Click the Sign out button.

Expected: redirected to `/admin/login`. Visiting `/admin/leads` now redirects to login again.

- [ ] **Step 7: Final commit if all tests pass**

```bash
git add .
git commit -m "test: manual e2e admin auth gate verified"
```

---

## Notes for the implementer

- The `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` env vars must be set in `.env.local`. Check `lib/supabase/env.ts` for the var names.
- Do NOT use the service role key (`SUPABASE_SERVICE_ROLE_KEY`) for auth operations — only the anon key.
- The middleware only checks for the cookie's existence. It does not verify the JWT signature. This is acceptable for a single-admin app — a stolen cookie would be required to bypass it.
- When this app is deployed to Vercel (next session), set the same env vars in the Vercel dashboard.
