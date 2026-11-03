import { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { PATHS } from "../routes/paths";
import newLogo from "../assets/logonova.png";
import { useAuth } from "../contexts/AuthContext";

function AppLayout() {
  const { session, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  // No celular o menu lateral abre por cima da tela; Esc fecha.
  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

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

          /* ---------- Menu lateral ---------- */

          /* Celular: barra fina no topo (com o botão do menu) e a lateral
             aparece por cima do conteúdo quando aberta. */
          .app-shell {
            display: flex;
            flex-direction: column;
          }

          .app-shell .app-topbar {
            position: sticky;
            top: 0;
            z-index: 1030;
            background: linear-gradient(160deg, #0f1c35, #03070f);
            border-bottom: 1px solid rgba(255, 255, 255, .08);
          }

          .app-shell .app-backdrop {
            position: fixed;
            inset: 0;
            z-index: 1039;
            background: rgba(0, 0, 0, .55);
          }

          .app-shell .app-sidebar {
            position: fixed;
            top: 0;
            bottom: 0;
            left: 0;
            z-index: 1040;
            width: 260px;
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
            padding: 1.25rem 1rem;
            overflow-y: auto;
            background: linear-gradient(160deg, #0f1c35, #03070f);
            border-right: 1px solid rgba(255, 255, 255, .08);
            transform: translateX(-100%);
            visibility: hidden;
            transition: transform .25s ease, visibility .25s;
          }

          .app-shell .app-sidebar.open {
            transform: none;
            visibility: visible;
          }

          /* min-width: 0 evita que tabelas e gráficos estourem a largura */
          .app-shell .app-main {
            flex: 1 1 auto;
            min-width: 0;
          }

          .app-shell .app-sidebar .nav-link {
            color: #A0AEC0;
            border-radius: .75rem;
            padding: .7rem 1rem;
          }

          .app-shell .app-sidebar .nav-link:hover,
          .app-shell .app-sidebar .nav-link:focus-visible {
            color: #fff;
            background-color: rgba(255, 255, 255, .05);
          }

          .app-shell .app-sidebar .nav-link.active {
            color: #fff;
            background-color: rgba(255, 255, 255, .1);
          }

          /* Computador: lateral fixa à esquerda, conteúdo ao lado */
          @media (min-width: 992px) {
            .app-shell {
              flex-direction: row;
            }

            .app-shell .app-sidebar {
              position: sticky;
              top: 0;
              align-self: flex-start;
              flex: 0 0 250px;
              width: 250px;
              height: 100vh;
              height: 100dvh;
              z-index: auto;
              transform: none;
              visibility: visible;
              transition: none;
            }
          }
        `}
      </style>

      {/* Barra superior: só aparece no celular/tablet */}
      <header className="navbar navbar-dark d-lg-none app-topbar px-3">
        <span className="navbar-brand fw-bold d-flex align-items-center gap-2 m-0">
          <img
            src={newLogo}
            alt="Logo BiblioGestão"
            style={{ width: "34px", borderRadius: "9px" }}
          />
          BiblioGestão
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
      </header>

      {/* Fundo escuro atrás do menu aberto (clicar fecha) */}
      {menuOpen && (
        <div
          className="app-backdrop d-lg-none"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <aside
        id="menu-principal"
        className={`app-sidebar${menuOpen ? " open" : ""}`}
      >
        <div className="d-flex align-items-center gap-2 px-2 text-white fw-bold fs-5">
          <img
            src={newLogo}
            alt="Logo BiblioGestão"
            style={{ width: "34px", borderRadius: "9px" }}
          />
          <span>BiblioGestão</span>
        </div>

        <nav className="nav flex-column gap-1">
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
            Dashboard
          </NavLink>
        </nav>

        {/* mt-auto empurra usuário e botão "Sair" para o rodapé do menu */}
        <div className="mt-auto d-flex flex-column gap-2 px-2">
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
      </aside>

      {/* a página da rota atual aparece aqui */}
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;
