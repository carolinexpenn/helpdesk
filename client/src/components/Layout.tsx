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
      <nav style={{ display: "flex", justifyContent: "space-between", padding: "1rem", borderBottom: "1px solid #ccc" }}>
        <span>Helpdesk</span>
        <span>
          {data?.user.name}
          <button onClick={handleSignOut} style={{ marginLeft: "1rem" }}>
            Sign out
          </button>
        </span>
      </nav>
      <Outlet />
    </div>
  );
}

export default Layout;
