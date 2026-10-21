import { Routes, Route } from "react-router-dom";

import AuthLayout from "../layouts/AuthLayout";
import AppLayout from "../layouts/AppLayout";

import HomePage from "../pages/HomePage/HomePage";
import SearchPage from "../pages/SearchPage/SearchPage";
import LoginPage from "../pages/LoginPage/LoginPage";
import BookCreatePage from "../pages/BookCreatePage/BookCreatePage";
import NotFoundPage from "../pages/NotFoundPage/NotFoundPage";

import { PATHS } from "./paths";

function AppRoutes() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path={PATHS.login} element={<LoginPage />} />
      </Route>

      <Route element={<AppLayout />}>
        <Route path={PATHS.home} element={<HomePage />} />
        <Route path={PATHS.books} element={<SearchPage />} />
        <Route path={PATHS.booksNew} element={<BookCreatePage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRoutes;
