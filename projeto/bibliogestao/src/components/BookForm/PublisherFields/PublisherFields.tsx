interface PublisherFieldsProps {
  publisherName: string;
  setPublisherName: React.Dispatch<React.SetStateAction<string>>;
  publisherCountry: string;
  setPublisherCountry: React.Dispatch<React.SetStateAction<string>>;
}

function PublisherFields({
  publisherName,
  setPublisherName,
  publisherCountry,
  setPublisherCountry,
}: PublisherFieldsProps) {
  return (
    <>
      <fieldset className="border rounded-4 p-4 mb-4">
        <legend className="float-none w-auto px-2 fw-bold fs-5">Editora</legend>
        {/* Publisher Name -- Required */}
        <div className="mb-3">
          <label htmlFor="inputPublisherName" className="form-label fw-semibold">
            Nome da Editora
          </label>
          <input
            required
            type="text"
            className="form-control form-control-lg"
            id="inputPublisherName"
            value={publisherName}
            onChange={(event) => setPublisherName(event.target.value)}
          />
        </div>
        {/* Publisher Country -- Required */}
        <div className="mb-3">
          <label htmlFor="inputPublisherCountry" className="form-label fw-semibold">
            País de Origem
          </label>
          <input
            type="text"
            className="form-control form-control-lg"
            id="inputPublisherCountry"
            value={publisherCountry}
            onChange={(event) => setPublisherCountry(event.target.value)}
          />
        </div>
      </fieldset>
    </>
  );
}

export default PublisherFields;
