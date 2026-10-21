import { useState, type FormEvent } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import logonova from "../../assets/logonova.png";
import { supabase } from "../../lib/supabase-client";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
            `}
      </style>

      <div className="text-center text-white mb-4">
        <img
          src={logonova}
          alt="Logo BiblioGestão"
          style={{
            width: "90px",
            marginBottom: "20px",
            borderRadius: "22px",
          }}
        />

        <h1 className="fw-bold">BiblioGestão</h1>
        <p className="text-secondary" style={{ color: "#A0AEC0" }}>
          Sistema de Controle de Acervo
        </p>
      </div>

      <div
        className="bg-light p-5 shadow-lg"
        style={{
          width: "700px",
          maxWidth: "95%",
          borderRadius: "30px",
        }}
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
            <input
              id="password"
              type="password"
              className="form-control form-control-lg rounded-4 meu-placeholder font-input"
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              disabled={loading}
            />
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
    </>
  );
}

export default LoginPage;
