import { Routes, Route, Navigate } from "react-router-dom";

import AuthLayout from "../Layouts/AuthLayout";
import AppLayout from "../Layouts/AppLayout";

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
        <Route
          path={PATHS.home}
          element={<Navigate to={PATHS.books} replace />}
        />
        <Route path={PATHS.booksNew} element={<BookCreatePage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRoutes;
