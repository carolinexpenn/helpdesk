import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router";
import { signIn } from "@/lib/auth-client";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").check(z.email("Enter a valid email")),
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

  const inputClass = (hasError?: boolean) =>
    `w-full px-3 py-1.5 border rounded-md ${
      hasError ? "border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/25" : "border-gray-300"
    }`;

  return (
    <div className="max-w-xs mx-auto mt-16 p-6 border border-gray-200 rounded-lg shadow-sm">
      <div className="text-center">
        <h1 className="font-bold">Helpdesk</h1>
        <p className="mt-1 text-gray-600">Sign into your account</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-6">
        {error && <p className="text-red-600">{error}</p>}
        <div>
          <label htmlFor="email" className="block mb-1">
            Email
          </label>
          <input id="email" type="email" {...register("email")} className={inputClass(!!errors.email)} />
          {errors.email && <p className="text-red-600 mt-1">{errors.email.message}</p>}
        </div>
        <div className="mt-3">
          <label htmlFor="password" className="block mb-1">
            Password
          </label>
          <input id="password" type="password" {...register("password")} className={inputClass(!!errors.password)} />
          {errors.password && <p className="text-red-600 mt-1">{errors.password.message}</p>}
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`mt-4 w-full py-2 rounded-md text-white bg-blue-600 ${isSubmitting ? "cursor-default" : "cursor-pointer"}`}
        >
          {isSubmitting ? "Logging in..." : "Log in"}
        </button>
      </form>
    </div>
  );
}

export default LoginPage;
