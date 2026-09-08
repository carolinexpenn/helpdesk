import { Navigate, Outlet } from "react-router";
import { useSession } from "@/lib/auth-client";
import { Role } from "@/constants/role";

function AdminRoute() {
  const { data, isPending } = useSession();

  if (isPending) {
    return <div className="p-4 text-muted-foreground">Loading ... </div>;
  }

  if (data?.user.role !== Role.admin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default AdminRoute;
