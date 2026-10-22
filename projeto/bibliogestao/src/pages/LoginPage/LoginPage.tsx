import { supabase } from "../../lib/supabase-client";
import "bootstrap/dist/css/bootstrap.min.css";
import { useState, type FormEvent } from "react";
import newLogo from "../../assets/newLogo.png";
import eyeOpen from "../../assets/eyeOpen.png";
import eyeClosed from "../../assets/eyeClosed.png";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (error) {
      setErrorMessage("E-mail ou senha inválidos.");
      return;
    }
  }

  return (
    <>
      <style>
        {`
                .meu-placeholder::placeholder {
                    color: #adacac;
                    font-size: 17px;
                }

                .fs-7 {
                    font-size: 0.9rem;
                }

                .font-input {
                    font-size: 17px;
                }

                /* Cartão do formulário: largura original no celular,
                   um pouco menor no computador para caber ao lado da logo */
                .login-card {
                    width: 700px;
                    max-width: 95%;
                }

                @media (min-width: 992px) {
                    .login-card {
                        width: 560px;
                        max-width: 560px;
                    }
                }
                
                .login-logo {
                    width: 90px;
                }

                @media (min-width: 992px) {
                    .login-logo {
                        width: 182px;
                    }

                    .login-title {
                        font-size: 4rem;
                    }

                    .login-slogan {
                        font-size: 1.3rem;
                    }
                }
            `}
      </style>

      {/* Celular: logo em cima do formulário. Computador (lg): logo à esquerda. */}
      <div className="d-flex flex-column flex-lg-row align-items-center justify-content-center justify-content-lg-around px-lg-5 w-100">
        <div className="text-center text-white mb-4 mb-lg-0">
          <img
            src={newLogo}
            alt="Logo BiblioGestão"
            className="login-logo"
            style={{
              marginBottom: "20px",
              borderRadius: "22px",
            }}
          />  

          <h1 className="fw-bold login-title">BiblioGestão</h1>
          <p className="text-secondary login-slogan" style={{ color: "#A0AEC0" }}>
            Sistema de Controle de Acervo
          </p>
        </div>

        <div
          className="login-card bg-light p-5 shadow-lg"
          style={{ borderRadius: "30px" }}
        >
          <h2 className="fw-bold mb-2">Entrar na conta</h2>

          <p className="text-secondary mb-4 fs-7">
            Acesso exclusivo aos funcionários autorizados
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="form-label fw-semibold" htmlFor="email">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                className="form-control form-control-lg rounded-4 meu-placeholder font-input"
                placeholder="Digite seu e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                disabled={loading}
              />
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold" htmlFor="password">
                Senha
              </label>
              <div className="position-relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="form-control form-control-lg rounded-4 meu-placeholder font-input pe-5"
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  disabled={loading}
                />

                <button
                  type="button"
                  className="btn btn-link position-absolute top-50 end-0 translate-middle-y me-2 p-1 text-secondary text-decoration-none"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  onClick={() => setShowPassword((current) => !current)}
                  disabled={loading}
                >
                  <img
                    src={showPassword ? eyeClosed : eyeOpen}
                    alt=""
                    width="20"
                    height="20"
                  />
                </button>
              </div>
            </div>

            {errorMessage && (
              <div className="alert alert-danger rounded-4" role="alert">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-lg w-100 rounded-4 text-white"
              style={{ backgroundColor: "#1A335B" }}
              disabled={loading}
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <div className="text-center mt-3">
            <a href="#" className="text-decoration-none text-secondary">
              Esqueceu a senha?
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

export default LoginPage;
