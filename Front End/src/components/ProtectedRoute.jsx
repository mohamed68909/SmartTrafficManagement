// ═══ PROTECTED ROUTE ═══
// Reads role from localStorage.
// If no token → redirect to / (login)
// If role doesn't match route → redirect to /unauthorized
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const role  = localStorage.getItem('role');

  // No token → redirect to login
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // Role doesn't match → redirect to unauthorized
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
