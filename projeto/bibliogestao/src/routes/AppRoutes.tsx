import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";

import AuthLayout from "../layouts/AuthLayout";
import AppLayout from "../layouts/AppLayout";
import ProtectedRoute from "./ProtectedRoute";

import HomePage from "../pages/HomePage/HomePage";
import SearchPage from "../pages/SearchPage/SearchPage";
import LoginPage from "../pages/LoginPage/LoginPage";
import BookCreatePage from "../pages/BookCreatePage/BookCreatePage";
import NotFoundPage from "../pages/NotFoundPage/NotFoundPage";
import SetPasswordPage from "../pages/SetPasswordPage/SetPasswordPage";
const DashboardPage = lazy(
  () => import("../pages/DashboardPage/DashboardPage"),
);

import { PATHS } from "./paths";

function AppRoutes() {
  return (
    <Suspense fallback={<p className="text-white p-4">Carregando...</p>}>
      <Routes>
        <Route path={PATHS.setPassword} element={<SetPasswordPage />} />

        <Route element={<AuthLayout />}>
          <Route path={PATHS.login} element={<LoginPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path={PATHS.home} element={<HomePage />} />
            <Route path={PATHS.books} element={<SearchPage />} />
            <Route path={PATHS.booksNew} element={<BookCreatePage />} />
            <Route path={PATHS.dashboard} element={<DashboardPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
