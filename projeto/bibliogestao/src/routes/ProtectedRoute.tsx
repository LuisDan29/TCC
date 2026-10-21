import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { PATHS } from "./paths";

function ProtectedRoute() {
  const { session, loading } = useAuth();

  // Enquanto o Supabase confirma a sessão, não decide nada (evita "piscar" o login)
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        Carregando...
      </div>
    );
  }

  if (!session) {
    return <Navigate to={PATHS.login} replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
