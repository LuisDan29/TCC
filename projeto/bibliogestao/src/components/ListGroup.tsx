function ListGroup() {
  const movies = [
    "How To Train Your Dragon I",
    "Pulp Fiction",
    "The Dark Knight",
    "Kill Bill Vol. II",
    "Mônica's Ganga",
  ];

  return (
    <>
      <h1>List</h1>
      <ul className="list-group">
        {movies.map((movie) => (
          <li key={movie} className="list-group-item">
            {movie}
          </li>
        ))}
      </ul>
    </>
  );
}

export default ListGroup;
