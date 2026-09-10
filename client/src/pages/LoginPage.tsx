import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Navigate, useNavigate } from "react-router";
import { signIn, useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").check(z.email("Enter a valid email")),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { data: session, isPending } = useSession();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  if (isPending) {
    return <div className="p-4 text-muted-foreground">Loading ... </div>;
  }

  if (session) {
    return <Navigate to="/" replace />;
  }

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
    <div className="flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-xs">
        <CardHeader className="text-center">
          <CardTitle className="text-lg">Helpdesk</CardTitle>
          <CardDescription>Sign into your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            {error && <p className="mb-3 text-sm text-destructive">{error}</p>}
            <div>
              <Label htmlFor="email" className="mb-1">
                Email
              </Label>
              <Input id="email" type="email" aria-invalid={!!errors.email} {...register("email")} />
              {errors.email && <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <div className="mt-3">
              <Label htmlFor="password" className="mb-1">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                aria-invalid={!!errors.password}
                {...register("password")}
              />
              {errors.password && <p className="mt-1 text-sm text-destructive">{errors.password.message}</p>}
            </div>
            <Button type="submit" disabled={isSubmitting} className="mt-4 w-full">
              {isSubmitting ? "Logging in..." : "Log in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default LoginPage;
