type LoginPageProps = {
  searchParams?: Promise<{
    error?: string;
    next?: string;
  }>;
};

export default async function AdminLoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const error = params?.error;
  const next = params?.next ?? "/admin/businesses";

  function errorMessage(code: string | undefined) {
    if (code === "credentials") return "Invalid email or password.";
    if (code === "invalid") return "Please enter your email and password.";
    if (code === "unknown") return "Something went wrong. Try again.";
    return null;
  }

  const message = errorMessage(error);

  const inputClass =
    "w-full rounded-xl border border-brand-beige bg-white px-3.5 py-2.5 text-sm text-brand-forest outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/40";

  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-cream px-4 py-16">
      <div className="motion-page w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-forest text-sm font-black text-brand-gold">
            UBI
          </div>
          <h1 className="text-xl font-black tracking-tight text-brand-forest">Admin Login</h1>
          <p className="mt-1 text-xs text-brand-green">Business Yoo administration</p>
        </div>

        <div className="rounded-2xl border border-brand-beige bg-brand-surface p-6 shadow-sm shadow-brand-forest/5">
          {message && (
            <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm font-semibold text-red-700">
              {message}
            </p>
          )}
          <form method="POST" action="/api/auth/login">
            <input type="hidden" name="next" value={next} />
            <div className="mb-4">
              <label htmlFor="email" className="mb-1.5 block text-xs font-bold text-brand-forest">
                Email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                required
                autoComplete="email"
                className={inputClass}
              />
            </div>
            <div className="mb-6">
              <label htmlFor="password" className="mb-1.5 block text-xs font-bold text-brand-forest">
                Password
              </label>
              <input
                id="password"
                type="password"
                name="password"
                required
                autoComplete="current-password"
                className={inputClass}
              />
            </div>
            <button
              type="submit"
              className="motion-press w-full rounded-xl bg-brand-forest py-2.5 text-sm font-bold text-brand-cream transition-colors hover:bg-brand-green focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2"
            >
              Sign in
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
