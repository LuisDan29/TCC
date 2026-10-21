import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { PATHS } from "../routes/paths";

function AuthLayout() {
  const { session, loading } = useAuth();

  if (loading) return null;

  if (session) {
    return <Navigate to={PATHS.home} replace />;
  }

  return (
    <div
      className="container-fluid min-vh-100 d-flex flex-column justify-content-center align-items-center"
      style={{ backgroundColor: "#0f1c35" }}
    >
      <Outlet />
    </div>
  );
}

export default AuthLayout;
