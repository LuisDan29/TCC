interface CollectionFieldsProps {
  condition: number;
  setCondition: React.Dispatch<React.SetStateAction<number>>;
  numberBooksInserted: number;
  setNumberBooksInserted: React.Dispatch<React.SetStateAction<number>>;
}

function CollectionFields({
  condition,
  setCondition,
  numberBooksInserted,
  setNumberBooksInserted,
}: CollectionFieldsProps) {
  return (
    <>
      <fieldset className="border border-dark p-3 rounded mb-3">
        <legend className="float-none w-auto px-2">Acervo</legend>
        {/* Condition -- Number */}
        <div className="mb-3">
          <label htmlFor="inputCondition" className="form-label">
            Condição (0-5)
          </label>
          <input
            type="range"
            className="form-range"
            min="0"
            max="5"
            id="inputCondition"
            value={condition}
            onChange={(event) => setCondition(Number(event.target.value))}
          />
          <div id="emailHelp" className="form-text">
            0 - Irrecuperável; 1 - Condição Precária; 2 - Desgastado; 3 -
            Condição regular; 4 - Bem conservado; 5 - Novo
          </div>
        </div>
        {/* Books Qty. -- Number */}
        <div className="mb-3">
          <label htmlFor="inputNumberBooksInserted" className="form-label">
            Quantidade de livros a ser inseridos
          </label>
          <input
            type="number"
            className="form-control"
            id="inputNumberBooksInserted"
            value={numberBooksInserted}
            onChange={(event) =>
              setNumberBooksInserted(Number(event.target.value))
            }
          />
        </div>
      </fieldset>
    </>
  );
}

export default CollectionFields;
