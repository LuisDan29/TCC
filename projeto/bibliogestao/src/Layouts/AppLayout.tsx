import { NavLink, Outlet } from "react-router-dom";

function AppLayout() {
  return (
    <>
      <nav className="navbar navbar-expand navbar-dark" style={{ backgroundColor: "#0f1c35" }}>
        <div className="container">
          <span className="navbar-brand fw-bold">BiblioGestão</span>
          <div className="navbar-nav">
            <NavLink to="/livros" end className="nav-link">Pesquisar</NavLink>
            <NavLink to="/livros/novo" className="nav-link">Cadastrar</NavLink>
          </div>
        </div>
      </nav>

      {/* a página da rota atual aparece aqui */}
      <Outlet />
    </>
  );
}

export default AppLayout;