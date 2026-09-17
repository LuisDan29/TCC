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
      <fieldset className="border border-dark p-3 rounded mb-3">
        <legend className="float-none w-auto px-2">Editora</legend>
        {/* Publisher Name -- Required */}
        <div className="mb-3">
          <label htmlFor="inputPublisherName" className="form-label">
            Nome da Editora
          </label>
          <input
            required
            type="text"
            className="form-control"
            id="inputPublisherName"
            value={publisherName}
            onChange={(event) => setPublisherName(event.target.value)}
          />
        </div>
        {/* Publisher Country -- Required */}
        <div className="mb-3">
          <label htmlFor="inputPublisherCountry" className="form-label">
            País de Origem
          </label>
          <input
            required
            type="text"
            className="form-control"
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
