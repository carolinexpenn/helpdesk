import { Link, Outlet, useNavigate } from "react-router";
import { signOut, useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Role } from "@/constants/role";

function Layout() {
  const { data } = useSession();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate("/login", { replace: true });
  }

  return (
    <div>
      <nav className="flex items-center justify-between border-b border-border bg-white p-4 text-black">
        <span className="flex items-center gap-4">
          <span className="font-bold">Helpdesk</span>
          {data?.user.role === Role.admin && (
            <Link to="/users" className="text-sm font-medium">
              Users
            </Link>
          )}
        </span>
        <span className="flex items-center gap-4 text-sm font-medium">
          {data?.user.name}
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            Sign out
          </Button>
        </span>
      </nav>
      <Outlet />
    </div>
  );
}

export default Layout;
