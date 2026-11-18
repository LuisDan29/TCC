import { isCatalogFormat, normalizeName } from "../../../utils/textUtils";

interface AuthorFieldsProps {
  authors: string[];
  setAuthors: React.Dispatch<React.SetStateAction<string[]>>;
  acceptedAuthors: string[];
  setAcceptedAuthors: React.Dispatch<React.SetStateAction<string[]>>;
}

function AuthorFields({
  authors,
  setAuthors,
  acceptedAuthors,
  setAcceptedAuthors,
}: AuthorFieldsProps) {
  function addAuthor() {
    setAuthors([...authors, ""]);
  }

  function handleAuthorChange(index: number, value: string) {
    const newAuthors = [...authors];
    newAuthors[index] = value;

    setAuthors(newAuthors);
  }

  function removeAuthor(index: number) {
    const newAuthors = authors.filter((_, i) => i != index);

    setAuthors(newAuthors);
  }

  function toggleAccepted(name: string, accepted: boolean) {
    setAcceptedAuthors((previous) =>
      accepted
        ? [...previous.filter((item) => item !== name), name]
        : previous.filter((item) => item !== name),
    );
  }

  return (
    <>
      {/* AUTHOR FIELD */}
      <fieldset className="border rounded-4 p-4 mb-4">
        <legend className="float-none w-auto px-2 fw-bold fs-5">Autoria</legend>

        {authors.map((author, index) => {
          const cleanName = normalizeName(author);
          const needsReview = cleanName !== "" && !isCatalogFormat(cleanName);
          const isAccepted = acceptedAuthors.includes(cleanName);

          return (
          <div className="mb-3" key={index}>
            <label
              htmlFor={`author-${index}`}
              className="form-label fw-semibold"
            >
              Autor {index + 1} <span className="text-danger">*</span>
            </label>
            <div className="d-flex gap-2">
              <input
                required={index === 0}
                className={`form-control form-control-lg ${
                  needsReview && !isAccepted ? "border-warning" : ""
                }`}
                list="datalistOptions"
                id={`author-${index}`}
                placeholder="SOBRENOME, Nome"
                value={author}
                onChange={(event) =>
                  handleAuthorChange(index, event.target.value)
                }
              />

              {index > 0 && (
                <button
                  type="button"
                  className="btn btn-outline-danger"
                  aria-label={`Remover autor ${index + 1}`}
                  onClick={() => removeAuthor(index)}
                >
                  Remover
                </button>
              )}
            </div>

            {needsReview && (
              <div className="form-text mt-1">
                <div className="text-warning-emphasis">
                  ⚠️ Fora do padrão "SOBRENOME, Nome". Corrija o nome ou confirme
                  abaixo.
                </div>
                <div className="form-check mt-1">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id={`author-accept-${index}`}
                    checked={isAccepted}
                    onChange={(event) =>
                      toggleAccepted(cleanName, event.target.checked)
                    }
                  />
                  <label
                    className="form-check-label"
                    htmlFor={`author-accept-${index}`}
                  >
                    Manter assim (ex.: entidade ou autor de nome único)
                  </label>
                </div>
              </div>
            )}
          </div>
          );
        })}

        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-primary btn-lg"
            type="button"
            onClick={addAuthor}
          >
            + Adicionar outro autor
          </button>
        </div>

        <datalist id="datalistOptions"></datalist>
      </fieldset>
    </>
  );
}

export default AuthorFields;
