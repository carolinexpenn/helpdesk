import { Outlet, useNavigate } from "react-router";
import { signOut, useSession } from "@/lib/auth-client";

function Layout() {
  const { data } = useSession();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate("/login", { replace: true });
  }

  return (
    <div>
      <nav className="flex justify-between items-center p-4 bg-black text-white">
        <span className="font-bold">Helpdesk</span>
        <span>
          {data?.user.name}
          <button onClick={handleSignOut} className="ml-4 cursor-pointer hover:underline">
            Sign out
          </button>
        </span>
      </nav>
      <Outlet />
    </div>
  );
}

export default Layout;
