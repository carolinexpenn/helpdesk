import { Navigate, Outlet } from "react-router";
import { useSession } from "@/lib/auth-client";

function ProtectedRoute() {
  const { data, isPending } = useSession();

  if (isPending) {
    return <div className="loading">Loading ... </div>;
  }

  if (!data?.user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
