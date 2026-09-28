import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import LoadingScreen from "../../components/common/LoadingScreen";
import { useAuth } from "../providers/AuthProvider";

function ProtectedRoute() {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <LoadingScreen message="Đang xác thực tài khoản..." />
    );
  }

  if (!session) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  return <Outlet />;
}

export default ProtectedRoute;