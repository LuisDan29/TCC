//import BookForm from "./components/BookForm";
import LoginForm from "./components/LoginForm";
import BookForm from "./components/BookForm/BookForm.tsx";

function App() {
  const movies = [
    "How To Train Your Dragon I",
    "Pulp Fiction",
    "The Dark Knight",
    "Kill Bill Vol. II",
    "Mônica's Ganga",
  ];

  return <BookForm/> 
  // <LoginForm/> <ListGroup items={movies} heading="Movies" />; 
}

export default App;