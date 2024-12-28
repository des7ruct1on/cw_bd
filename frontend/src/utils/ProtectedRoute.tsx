import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  component: React.ComponentType<any>;
  isAuthenticated: boolean | undefined;
  checkAdminPermission: boolean;
  isAdmin: boolean | undefined;
  [key: string]: any;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  component: Component,
  isAuthenticated,
  checkAdminPermission,
  isAdmin,
  ...rest
}) => {
  if (isAuthenticated === undefined) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (checkAdminPermission && !isAdmin) {
    return <Navigate to="/permission-denied" replace />;
  }

  return <Component {...rest} />;
};

export default ProtectedRoute;
