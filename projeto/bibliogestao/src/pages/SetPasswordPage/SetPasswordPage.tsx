import { useEffect, useRef, useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { EmailOtpType } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabase-client";
import { PATHS } from "../../routes/paths";

function SetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const startedRef = useRef(false);

  const [status, setStatus] = useState<"verifying" | "ready" | "invalid">(
    "verifying",
  );
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const tokenHash = searchParams.get("token_hash");
    const type = searchParams.get("type");

    if (!tokenHash || (type !== "invite" && type !== "recovery")) {
      setStatus("invalid");
      return;
    }

    supabase.auth
      .verifyOtp({ token_hash: tokenHash, type: type as EmailOtpType })
      .then(({ error }) => setStatus(error ? "invalid" : "ready"));
  }, [searchParams]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage(null);

    if (password.length < 8) {
      setErrorMessage("A senha deve ter pelo menos 8 caracteres.");
      return;
    }
    if (password !== confirm) {
      setErrorMessage("As senhas não coincidem.");
      return;
    }

    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSaving(false);

    if (error) {
      setErrorMessage(
        "Não foi possível salvar a senha. Verifique os requisitos e tente novamente.",
      );
      return;
    }

    navigate(PATHS.home, { replace: true });
  }

    return (
    <div
      className="container-fluid min-vh-100 d-flex flex-column justify-content-center align-items-center"
      style={{ backgroundColor: "#0f1c35" }}
    >
      <div
        className="bg-light p-5 shadow-lg"
        style={{ width: "520px", maxWidth: "95%", borderRadius: "30px" }}
      >
        {status === "verifying" && <p className="mb-0">Validando link...</p>}

        {status === "invalid" && (
          <>
            <h2 className="fw-bold mb-2">Link inválido ou expirado</h2>
            <p className="text-secondary mb-0">
              Peça um novo convite ao administrador do sistema.
            </p>
          </>
        )}

        {status === "ready" && (
          <>
            <h2 className="fw-bold mb-2">Crie sua senha</h2>
            <p className="text-secondary mb-4">
              Defina a senha que você usará para entrar no BiblioGestão.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-semibold" htmlFor="new-password">
                  Nova senha
                </label>
                <input
                  id="new-password"
                  type="password"
                  className="form-control form-control-lg rounded-4"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  disabled={saving}
                />
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold" htmlFor="confirm-password">
                  Confirmar senha
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  className="form-control form-control-lg rounded-4"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="new-password"
                  required
                  disabled={saving}
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
                disabled={saving}
              >
                {saving ? "Salvando..." : "Salvar senha"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default SetPasswordPage;

