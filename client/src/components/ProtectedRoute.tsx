import { Navigate, Outlet } from "react-router";
import { useSession } from "@/lib/auth-client";

function ProtectedRoute() {
  const { data, isPending } = useSession();

  if (isPending) {
    return <div className="p-4 text-gray-500">Loading ... </div>;
  }

  if (!data?.user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
