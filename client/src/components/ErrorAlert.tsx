import axios from "axios";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ErrorAlertProps {
  message?: string;
  error?: unknown;
  fallback?: string;
}

function ErrorAlert({ message, error, fallback }: ErrorAlertProps) {
  const text = message ?? extractMessage(error) ?? fallback ?? "Something went wrong";

  return (
    <Alert variant="destructive">
      <AlertDescription>{text}</AlertDescription>
    </Alert>
  );
}

function extractMessage(error: unknown): string | undefined {
  if (axios.isAxiosError(error)) {
    return (error.response?.data as { error?: string } | undefined)?.error;
  }
  return undefined;
}

export default ErrorAlert;
