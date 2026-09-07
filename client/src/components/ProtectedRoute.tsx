import { Navigate, Outlet } from "react-router";
import { useSession } from "@/lib/auth-client";

function ProtectedRoute() {
  const { data, isPending } = useSession();

  if (isPending) {
    return <p>Loading...</p>;
  }

  if (!data?.user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
