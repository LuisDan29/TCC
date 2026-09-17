function LoginForm() {
  return (
    <div
      className="d-flex justify-content-center align-items-center min-vh-100"
      style={{ background: "linear-gradient(to bottom, #ffffff, #6e9cff)" }}
    >
      <div
        className="bg-white p-5 shadow-lg"
        style={{
          width: "100%",
          maxWidth: "450px",
          borderLeft: "12px solid #002b6b", // Lateral esquerda grossa
          borderRight: "12px solid #002b6b", // Lateral direita grossa
          borderTop: "3px solid #002b6b", // Em cima fina
          borderBottom: "3px solid #002b6b", // Embaixo fina
          borderRadius: "15px", // Mantém os cantos arredondados
        }}
      >
        <h2
          className="text-center mb-4 fw-bold text-dark"
          style={{ letterSpacing: "1px" }}
        >
          Acessar Conta
        </h2>

        <form>
          <div className="mb-3">
            <label
              htmlFor="exampleInputEmail1"
              className="form-label fw-semibold text-secondary"
            >
              Email:
            </label>
            <input
              type="email"
              className="form-control bg-light"
              id="exampleInputEmail1"
              aria-describedby="emailHelp"
              placeholder="pessoacredenciada@etec.com"
              style={{ border: "2px solid #002b6b" }}
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="exampleInputPassword1"
              className="form-label fw-semibold text-secondary"
            >
              Senha:
            </label>
            <input
              type="password"
              className="form-control bg-light"
              id="exampleInputPassword1"
              placeholder="••••••••"
              style={{ border: "2px solid #002b6b" }}
            />
          </div>

          <button
            type="submit"
            className="btn w-100 fw-bold py-2 mb-3"
            style={{ backgroundColor: "#002b6b", color: "white" }}
          >
            Entrar no Sistema
          </button>

          <div className="text-center mt-3">
            <span className="text-muted small">
              Entre em contato com o Administrador para possuir credenciais
              válidas{" "}
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginForm;
