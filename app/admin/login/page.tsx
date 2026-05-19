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
