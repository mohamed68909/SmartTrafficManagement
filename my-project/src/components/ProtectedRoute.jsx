// ═══ PROTECTED ROUTE ═══
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const normalizeRole = (role) => {
  const value = String(role || '').trim().toLowerCase();
  if (['cs', 'csagent', 'cs_agent', 'cs-agent', 'customer_support', 'customer support'].includes(value)) {
    return 'cs';
  }
  if (value === 'administrator') return 'admin';
  return value;
};

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const role  = normalizeRole(localStorage.getItem('role'));
  const location = useLocation();

  if (!token) {
    // save intended path so Landing can redirect back after login
    sessionStorage.setItem('redirectAfterLogin', location.pathname);
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
