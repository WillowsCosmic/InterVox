import { logout } from "@/lib/actions/auth.action";
import { Button } from "./ui/button";

const LogoutButton = () => {
  return (
    <form action={logout}>
      <Button type="submit" variant="outline" className="btn-secondary">
        Logout
      </Button>
    </form>
  );
};

export default LogoutButton;