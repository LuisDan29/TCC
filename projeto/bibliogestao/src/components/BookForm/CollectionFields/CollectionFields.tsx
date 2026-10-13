// https://chatgpt.com/share/6abd420f-9a00-83e9-a88c-2d467d90f6ef?ogimg=plain
interface CollectionFieldsProps {
  numberBooksInserted: number;
  setNumberBooksInserted: React.Dispatch<React.SetStateAction<number>>;
  bookConditions: number[];
  setBookConditions: React.Dispatch<React.SetStateAction<number[]>>;
}

const conditions = [
  {
    number: 0,
    name: "Irrecuperável",
    description: "Sem condição de uso.",
  },
  {
    number: 1,
    name: "Precária",
    description: "Apresenta muitos sinais de uso e danos.",
  },
  {
    number: 2,
    name: "Desgastado",
    description: "Apresenta sinais de desgaste.",
  },
  {
    number: 3,
    name: "Regular",
    description: "Condição aceitável, com sinais normais de uso.",
  },
  {
    number: 4,
    name: "Bem conservado",
    description: "Pouco sinais de uso, ótimo estado.",
  },
  {
    number: 5,
    name: "Novo",
    description: "Sem sinais de uso.",
  },
];

function CollectionFields({
  numberBooksInserted,
  setNumberBooksInserted,
  bookConditions,
  setBookConditions,
}: CollectionFieldsProps) {
  const totalDistributed = bookConditions.reduce(
    (total, quantity) => total + quantity,
    0,
  );

  function handleConditionChange(conditionNumber: number, quantity: number) {
    const newConditions = [...bookConditions];

    newConditions[conditionNumber] = quantity;

    setBookConditions(newConditions);
  }

  return (
    <>
      <fieldset className="border border-dark p-3 rounded mb-3">
        <legend className="float-none w-auto px-2">Acervo</legend>

        <div className="mb-5">
          <label htmlFor="inputNumberBooksInserted" className="form-label">
            Quantidade total de livros a ser inseridos
          </label>

          <input
            type="number"
            className="form-control"
            id="inputNumberBooksInserted"
            min="1"
            value={numberBooksInserted}
            onChange={(event) =>
              setNumberBooksInserted(Number(event.target.value))
            }
          />
        </div>

        <div className="d-flex fw-bold fs-5 mb-1">
          <div className="flex-grow-1">Condição</div>

          <div className="text-start flex-shrink-0">Quantidade</div>
        </div>

        {conditions.map((condition) => (
          <div
            key={condition.number}
            className="d-flex align-items-center border-bottom py-3"
          >
            <span className="badge bg-primary fs-6">{condition.number}</span>

            <div className="flex-grow-1 px-3" style={{ minWidth: 0 }}>
              <strong>{condition.name}</strong>

              <div className="text-muted small">{condition.description}</div>
            </div>

            <div>
              <input
                type="number"
                className="form-control"
                min="0"
                value={bookConditions[condition.number]}
                onChange={(event) =>
                  handleConditionChange(
                    condition.number,
                    Number(event.target.value),
                  )
                }
              />
            </div>
          </div>
        ))}

        <div className="text-end mt-4">
          <strong>
            Total distribuído: {totalDistributed} / {numberBooksInserted}
          </strong>
        </div>

        {totalDistributed === numberBooksInserted && (
          <div className="text-success text-end">✅ Quantidades conferem</div>
        )}

        {totalDistributed !== numberBooksInserted && (
          <div className="text-danger text-end">⚠️ Quantidade não confere</div>
        )}
      </fieldset>
    </>
  );
}

export default CollectionFields;
