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
      <fieldset className="border border-dark p-3 rounded mb-3">
        <legend className="float-none w-auto px-2">Autoria</legend>

        {authors.map((author, index) => (
          <div className="input-group mb-3" key={index}>
            <label htmlFor={`author-${index}`} className="input-group-text">
              Autor {index + 1}
            </label>
            <input
              className="form-control"
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
                onClick={() => removeAuthor(index)}
              >
                X
              </button>
            )}
          </div>
        ))}

        <div className="d-grip gap-2">
          <button className="btn btn-primary" type="button" onClick={addAuthor}>
            + Adicionar outro autor
          </button>
        </div>

        <datalist id="datalistOptions"></datalist>
      </fieldset>
    </>
  );
}

export default AuthorFields;
