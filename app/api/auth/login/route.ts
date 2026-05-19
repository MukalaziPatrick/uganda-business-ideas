import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAuthClient } from "@/lib/supabase/auth";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");
  const next = formData.get("next");

  // Validate next param — only allow relative paths to prevent open redirect (including protocol-relative //evil.com)
  const redirectTo =
    typeof next === "string" && next.startsWith("/") && !next.startsWith("//")
      ? next
      : "/admin/leads";

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
    maxAge: expires_at ? Math.max(expires_at - Math.floor(Date.now() / 1000), 60) : 3600,
  });

  if (refresh_token) {
    response.cookies.set("sb-refresh-token", refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
  }

  return response;
}
