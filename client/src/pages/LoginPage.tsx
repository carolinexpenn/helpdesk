import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router";
import { signIn } from "@/lib/auth-client";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginFormValues) {
    setError(null);

    const { error } = await signIn.email(values);

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
      <form onSubmit={handleSubmit(onSubmit)} style={{ marginTop: "1.5rem" }}>
        {error && <p style={{ color: "red", marginTop: 0 }}>{error}</p>}
        <div>
          <label htmlFor="email" style={{ display: "block", marginBottom: "0.25rem" }}>
            Email
          </label>
          <input
            id="email"
            type="email"
            {...register("email")}
            className={errors.email ? "input-error" : undefined}
            style={{ width: "100%", padding: "0.375rem 0.75rem", border: "1px solid #ced4da", borderRadius: "0.375rem" }}
          />
          {errors.email && <p style={{ color: "red", margin: "0.25rem 0 0" }}>{errors.email.message}</p>}
        </div>
        <div style={{ marginTop: "0.75rem" }}>
          <label htmlFor="password" style={{ display: "block", marginBottom: "0.25rem" }}>
            Password
          </label>
          <input
            id="password"
            type="password"
            {...register("password")}
            className={errors.password ? "input-error" : undefined}
            style={{ width: "100%", padding: "0.375rem 0.75rem", border: "1px solid #ced4da", borderRadius: "0.375rem" }}
          />
          {errors.password && <p style={{ color: "red", margin: "0.25rem 0 0" }}>{errors.password.message}</p>}
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
