import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      if (!isAuthenticated()) {
        setIsAuthorized(false);
        setIsLoading(false);
        return;
      }

      if (requiredRole) {
        const userRole = localStorage.getItem('role');
        if (userRole !== requiredRole) {
          setIsAuthorized(false);
          setIsLoading(false);
          return;
        }
      }

      setIsAuthorized(true);
      setIsLoading(false);
    };

    checkAuth();
  }, [requiredRole]);

  if (isLoading) {
    return <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="spinner-border" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>;
  }

  if (!isAuthorized) {
    if (!isAuthenticated()) {
      return <Navigate to="/login" replace />;
    } else {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
};

export default ProtectedRoute; 