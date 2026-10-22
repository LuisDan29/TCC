import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { PATHS } from "../routes/paths";
import newLogo from "../assets/newLogo.png";
import { useAuth } from "../contexts/AuthContext";

function AppLayout() {
  const { session, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      className="app-shell min-vh-100"
      style={{ backgroundColor: "#0f1c35" }}
    >
      {/* Tema do sistema: mesma identidade da tela de login.
          Tudo o que está dentro de .app-shell herda estas regras. */}
      <style>
        {`
          /* Botões principais: azul do botão "Entrar" */
          .app-shell .btn {
            border-radius: 1rem;
          }

          .app-shell .btn-sm {
            border-radius: .75rem;
          }

          .app-shell .btn-primary {
            --bs-btn-bg: #1A335B;
            --bs-btn-border-color: #1A335B;
            --bs-btn-hover-bg: #142849;
            --bs-btn-hover-border-color: #142849;
            --bs-btn-active-bg: #0f1f3b;
            --bs-btn-active-border-color: #0f1f3b;
            --bs-btn-disabled-bg: #1A335B;
            --bs-btn-disabled-border-color: #1A335B;
            --bs-btn-focus-shadow-rgb: 26, 51, 91;
          }

          .app-shell .btn-outline-primary {
            --bs-btn-color: #1A335B;
            --bs-btn-border-color: #1A335B;
            --bs-btn-hover-bg: #1A335B;
            --bs-btn-hover-border-color: #1A335B;
            --bs-btn-active-bg: #1A335B;
            --bs-btn-active-border-color: #1A335B;
            --bs-btn-disabled-color: #1A335B;
            --bs-btn-disabled-border-color: #1A335B;
            --bs-btn-focus-shadow-rgb: 26, 51, 91;
          }

          .app-shell .btn-link {
            color: #1A335B;
          }

          .app-shell .bg-primary,
          .app-shell .text-bg-primary {
            background-color: #1A335B !important;
          }

          /* Campos: cantos bem arredondados e placeholder cinza do login */
          .app-shell .form-control,
          .app-shell .form-select {
            border-radius: 1rem;
          }

          .app-shell .form-control::placeholder {
            color: #adacac;
          }

          /* Mesmo tamanho de letra dos campos do login (17px) */
          .app-shell .form-control-lg {
            font-size: 17px;
          }

          .app-shell .form-control-lg::placeholder {
            font-size: 17px;
          }

          .app-shell .form-control:focus,
          .app-shell .form-select:focus {
            border-color: #1A335B;
            box-shadow: 0 0 0 .25rem rgba(26, 51, 91, .2);
          }

          .app-shell .form-check-input:checked {
            background-color: #1A335B;
            border-color: #1A335B;
          }

          .app-shell .form-check-input:focus {
            border-color: #1A335B;
            box-shadow: 0 0 0 .25rem rgba(26, 51, 91, .2);
          }

          /* Avisos e modais */
          .app-shell .alert {
            border-radius: 1rem;
          }

          .app-shell .modal-content {
            border: 0;
            border-radius: 30px;
            background-color: #f8f9fa;
            box-shadow: 0 1rem 3rem rgba(0, 0, 0, .35);
          }

          .app-shell .modal-header,
          .app-shell .modal-footer {
            border-color: #dee2e6;
          }

          .app-shell .list-group-item {
            background-color: #fff;
          }

          .app-shell .list-group {
            border-radius: 1rem;
          }

          /* Menu superior */
          .app-shell .app-nav {
            border-bottom: 1px solid rgba(255, 255, 255, .08);
          }

          .app-shell .app-nav .nav-link {
            color: #A0AEC0;
            border-radius: .75rem;
            padding-inline: 1rem;
          }

          .app-shell .app-nav .nav-link:hover,
          .app-shell .app-nav .nav-link:focus-visible {
            color: #fff;
          }

          .app-shell .app-nav .nav-link.active {
            color: #fff;
            background-color: rgba(255, 255, 255, .1);
          }

          /* Computador: o menu fica exatamente como antes (itens lado a lado) */
          @media (min-width: 992px) {
            .app-shell .app-nav .navbar-collapse {
              display: contents !important;
            }
          }
        `}
      </style>

      <nav
        className="navbar navbar-expand-lg navbar-dark app-nav"
        style={{ background: "linear-gradient(160deg, #0f1c35, #03070f" }}
      >
        <div className="container">
          <span className="navbar-brand fw-bold d-flex align-items-center gap-2">
            <img
              src={newLogo}
              alt="Logo BiblioGestão"
              style={{ width: "34px", borderRadius: "9px" }}
            />
            <span className="d-none d-sm-inline">BiblioGestão</span>
          </span>
          <button
            type="button"
            className="navbar-toggler"
            aria-controls="menu-principal"
            aria-expanded={menuOpen}
            aria-label="Abrir menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="navbar-toggler-icon" />
          </button>

          <div
            id="menu-principal"
            className={`navbar-collapse collapse${menuOpen ? " show" : ""}`}
          >
            <div className="navbar-nav gap-1">
              <NavLink
                to="/"
                end
                className="nav-link"
                onClick={() => setMenuOpen(false)}
              >
                Início
              </NavLink>
              <NavLink
                to={PATHS.books}
                end
                className="nav-link"
                onClick={() => setMenuOpen(false)}
              >
                Pesquisar
              </NavLink>
              <NavLink
                to={PATHS.booksNew}
                className="nav-link"
                onClick={() => setMenuOpen(false)}
              >
                Cadastrar
              </NavLink>
              <NavLink
                to={PATHS.dashboard}
                className="nav-link"
                onClick={() => setMenuOpen(false)}
              >
                Relatórios
              </NavLink>
            </div>

            <div className="d-flex align-items-center gap-3 py-2 py-lg-0">
              <span className="text-white-50 small text-break">
                {session?.user.email}
              </span>
              <button
                type="button"
                className="btn btn-outline-light btn-sm"
                onClick={signOut}
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* a página da rota atual aparece aqui */}
      <Outlet />
    </div>
  );
}

export default AppLayout;
