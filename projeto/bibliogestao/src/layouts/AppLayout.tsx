import { NavLink, Outlet } from "react-router-dom";
import { PATHS } from "../routes/paths";
import { useAuth } from "../contexts/AuthContext";

function AppLayout() {
  const { session, signOut } = useAuth();

  return (
    <>
      <nav
        className="navbar navbar-expand navbar-dark"
        style={{ backgroundColor: "#0f1c35" }}
      >
        <div className="container">
          <span className="navbar-brand fw-bold">BiblioGestão</span>
          <div className="navbar-nav">
            <NavLink to="/" end className="nav-link">
              Início
            </NavLink>
            <NavLink to={PATHS.books} end className="nav-link">
              Pesquisar
            </NavLink>
            <NavLink to={PATHS.booksNew} className="nav-link">
              Cadastrar
            </NavLink>
          </div>

          <div className="d-flex align-items-center gap-3">
            <span className="text-white-50 small">{session?.user.email}</span>
            <button
              type="button"
              className="btn btn-outline-light btn-sm"
              onClick={signOut}
            >
              Sair
            </button>
          </div>
        </div>
      </nav>

      {/* a página da rota atual aparece aqui */}
      <Outlet />
    </>
  );
}

export default AppLayout;
