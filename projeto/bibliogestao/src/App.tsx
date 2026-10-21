import { Routes, Route } from "react-router-dom";

import AppLayout from "./Layouts/AppLayout";
import HomePage from "./components/HomePage/HomePage";
import LoginForm from "./components/LoginForm/LoginForm";
import SearchPage from "./components/SearchPage/SearchPage";
import BookForm from "./components/BookForm/BookForm";

function App() {
  return (
    <Routes>
      {/* fora do layout: a tela de login não tem navbar */}
      <Route path="/login" element={<LoginForm />} />

      {/* layout route: sem path, só element */}
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />.
        <Route path="livros" element={<SearchPage />} />
        <Route path="livros/novo" element={<BookForm />} />
      </Route>

      <Route path="*" element={<p className="container py-4">Página não encontrada.</p>} />
    </Routes>
  );
}

export default App;