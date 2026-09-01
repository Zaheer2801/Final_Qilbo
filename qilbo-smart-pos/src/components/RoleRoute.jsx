import { Navigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { canAccess } from "@/lib/permissions";

export default function RoleRoute({ path, children }) {
  const { user } = useAuth();
  if (!user || !canAccess(path, user.role)) {
    return <Navigate to="/home" replace />;
  }
  return children;
}