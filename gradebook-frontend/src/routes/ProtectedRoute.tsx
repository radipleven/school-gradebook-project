import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotAuthorizedPage from '../pages/NotAuthorizedPage';

interface ProtectedRouteProps {
  allowedRoles?: string[];
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const { userId, role } = useAuth();
  const location = useLocation();

  if (!userId) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (allowedRoles && (!role || !allowedRoles.includes(role))) {
    return <NotAuthorizedPage />;
  }
  return <>{children}</>;
};

export default ProtectedRoute; 