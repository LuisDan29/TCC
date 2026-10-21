interface AuthorFieldsProps {
  authors: string[];
  setAuthors: React.Dispatch<React.SetStateAction<string[]>>;
}

function AuthorFields({ authors, setAuthors }: AuthorFieldsProps) {
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

  return (
    <>
      {/* AUTHOR FIELD */}
      <fieldset className="border rounded-4 p-4 mb-4">
        <legend className="float-none w-auto px-2 fw-bold fs-5">Autoria</legend>

        {authors.map((author, index) => (
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
                className="form-control form-control-lg"
                list="datalistOptions"
                id={`author-${index}`}
                placeholder="Digite o nome do autor..."
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
                  X
                </button>
              )}
            </div>
          </div>
        ))}

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
