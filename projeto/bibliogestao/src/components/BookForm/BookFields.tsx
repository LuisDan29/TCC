interface BooksFieldProps {
  isbn: string;
  setISBN: React.Dispatch<React.SetStateAction<string>>;
  title: string;
  setTitle: React.Dispatch<React.SetStateAction<string>>;
  subtitle: string;
  setSubtitle: React.Dispatch<React.SetStateAction<string>>;
  edition: number;
  setEdition: React.Dispatch<React.SetStateAction<number>>;
  language: string;
  setLanguage: React.Dispatch<React.SetStateAction<string>>;
  publicationYear: number;
  setPublicationYear: React.Dispatch<React.SetStateAction<number>>;
  genres: string[];
  setGenres: React.Dispatch<React.SetStateAction<string[]>>;
  inputGenres: string;
  setInputGenres: React.Dispatch<React.SetStateAction<string>>;
}

function BookFields({
  isbn,
  setISBN,
  title,
  setTitle,
  subtitle,
  setSubtitle,
  edition,
  setEdition,
  language,
  setLanguage,
  publicationYear,
  setPublicationYear,
  genres,
  setGenres,
  inputGenres,
  setInputGenres,
}: BooksFieldProps) {
  const addGenre = () => {
    const genre = inputGenres.trim();

    if (!genre) return;

    if (genres.includes(genre)) {
      setInputGenres("");
      return;
    }

    setGenres([...genres, genre]);
    setInputGenres("");
  };

  const removeGenre = (genreToRemove: string) => {
    setGenres(genres.filter((genre) => genre !== genreToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addGenre();
    }
  };

  return (
    <>
      {/* BOOKS FIELD */}
      <fieldset className="border border-dark p-3 rounded mb-3">
        <legend className="float-none w-auto px-2">Informações da Obra</legend>
        {/* ISBN -- Required Text MaxLength=13 */}
        <div className="mb-3">
          <label htmlFor="inputISBN" className="form-label">
            ISBN
          </label>
          <input
            required
            type="text"
            maxLength={13}
            className="form-control"
            id="inputISBN"
            value={isbn}
            onChange={(event) => setISBN(event.target.value)}
          />
        </div>
        {/* Title -- Required */}
        <div className="mb-3">
          <label htmlFor="inputTitle" className="form-label">
            Título
          </label>
          <input
            required
            type="text"
            className="form-control"
            id="inputTitle"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </div>
        {/* Subtitle input */}
        <div className="mb-3">
          <label htmlFor="inputSubtitle" className="form-label">
            Subtítulo
          </label>
          <input
            type="text"
            className="form-control"
            id="inputSubtitle"
            value={subtitle}
            onChange={(event) => setSubtitle(event.target.value)}
          />
        </div>
        {/* Edition -- Number */}
        <div className="mb-3">
          <label htmlFor="inputEdition" className="form-label">
            Edição
          </label>
          <input
            type="number"
            className="form-control"
            id="inputEdition"
            value={edition}
            onChange={(event) => setEdition(Number(event.target.value))}
          />
        </div>
        {/* Language input */}
        <div className="mb-3">
          <label htmlFor="inputLanguage" className="form-label">
            Idioma
          </label>
          <input
            type="text"
            className="form-control"
            id="inputLanguage"
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
          />
        </div>
        {/* Publication Year -- Number Min=1000 Max=9999 */}
        <div className="mb-3">
          <label htmlFor="inputPublicationYear" className="form-label">
            Ano de Publicação
          </label>
          <input
            type="number"
            min={1000}
            max={9999}
            className="form-control"
            id="inputPublicationYear"
            value={publicationYear}
            onChange={(event) => setPublicationYear(Number(event.target.value))}
          />
        </div>
        {/* Genres Input */}
        <div className="mb-3">
          <label htmlFor="inputGenres" className="form-label">
            Gêneros
          </label>
          <div className="d-flex gap-3">
            <input
              required
              type="text"
              className="form-control"
              id="inputGenres"
              value={inputGenres}
              onKeyDown={handleKeyDown}
              onChange={(event) => setInputGenres(event.target.value)}
            />
            <input
              className="btn btn-primary"
              type="button"
              value="Adicionar"
              onClick={addGenre}
            />
          </div>
        </div>
        {/* Genres List */}
        <div className="mb-3 d-flex gap-2">
          {genres.map((genre) => (
            <span key={genre} className="badge text-bg-primary fs-6">
              {genre}
              <button
                type="button"
                className="border-0 bg-transparent text-white fw-bold p-0"
                aria-label={`Remover ${genre}`}
                style={{ fontSize: "1.1rem", lineHeight: 1, marginLeft: "6px" }}
                onClick={() => removeGenre(genre)}
              >
                x
              </button>
            </span>
          ))}
        </div>
      </fieldset>
    </>
  );
}

export default BookFields;
