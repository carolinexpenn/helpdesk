interface ErrorMessageProps {
  message?: string;
}

function ErrorMessage({ message }: ErrorMessageProps) {
  return <p className="mt-1 min-h-5 text-sm text-destructive">{message}</p>;
}

export default ErrorMessage;
