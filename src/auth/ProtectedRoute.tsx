import { useContext } from 'react';
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from './AuthContext';

function ProtectedRoute() {
  const { authenticated } = useContext(AuthContext)!;
  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export { ProtectedRoute };
