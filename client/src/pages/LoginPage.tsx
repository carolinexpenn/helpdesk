import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router";
import { signIn } from "@/lib/auth-client";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const { error } = await signIn.email({ email, password });

    setIsSubmitting(false);

    if (error) {
      setError(error.message ?? "Failed to sign in");
      return;
    }

    navigate("/", { replace: true });
  }

  return (
    <div
      style={{
        maxWidth: "320px",
        margin: "4rem auto",
        padding: "1.5rem",
        border: "1px solid #dee2e6",
        borderRadius: "0.5rem",
        boxShadow: "0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontWeight: "bold", margin: 0 }}>Helpdesk</h1>
        <p style={{ marginTop: "0.25rem", color: "#555" }}>Sign into your account</p>
      </div>
      <form onSubmit={handleSubmit} style={{ marginTop: "1.5rem" }}>
        {error && <p style={{ color: "red", marginTop: 0 }}>{error}</p>}
        <div>
          <label htmlFor="email" style={{ display: "block", marginBottom: "0.25rem" }}>
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: "100%", padding: "0.375rem 0.75rem", border: "1px solid #ced4da", borderRadius: "0.375rem" }}
          />
        </div>
        <div style={{ marginTop: "0.75rem" }}>
          <label htmlFor="password" style={{ display: "block", marginBottom: "0.25rem" }}>
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "100%", padding: "0.375rem 0.75rem", border: "1px solid #ced4da", borderRadius: "0.375rem" }}
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            marginTop: "1rem",
            width: "100%",
            padding: "0.5rem",
            backgroundColor: "#0d6efd",
            color: "#fff",
            border: "none",
            borderRadius: "0.375rem",
            cursor: isSubmitting ? "default" : "pointer",
          }}
        >
          {isSubmitting ? "Logging in..." : "Log in"}
        </button>
      </form>
    </div>
  );
}

export default LoginPage;
