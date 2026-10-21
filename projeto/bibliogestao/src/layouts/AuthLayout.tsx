import { Outlet } from "react-router-dom";

function AuthLayout() {
  return (
    <div
      className="container-fluid min-vh-100 d-flex flex-column justify-content-center align-items-center"
      style={{ backgroundColor: "#0f1c35" }}
    >
      <Outlet />
    </div>
  );
}

export default AuthLayout;
