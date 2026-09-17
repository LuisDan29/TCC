interface AuthorFieldsProps {
  authorFullName: string[];
  setAuthorFullName: React.Dispatch<React.SetStateAction<string[]>>;
}

function AuthorFields({
  authorFullName,
  setAuthorFullName,
}: AuthorFieldsProps) {
  function addAuthor() {
    setAuthorFullName([...authorFullName, ""]);
  }

  function handleAuthorChange(index: number, value: string) {
    const newAuthors = [...authorFullName];
    newAuthors[index] = value;

    setAuthorFullName(newAuthors);
  }

  function removeAuthor(index: number) {
    const newAuthors = authorFullName.filter((_, i) => i != index);

    setAuthorFullName(newAuthors);
  }

  return (
    <>
      {/* AUTHOR FIELD */}
      <fieldset className="border border-dark p-3 rounded mb-3">
        <legend className="float-none w-auto px-2">Autoria</legend>

        {authorFullName.map((author, index) => (
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
