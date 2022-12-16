import React from 'react';
import { Navigate } from 'react-router-dom';

export const MCProtectedRoute = ({
    isAuthenthicated,
    redirectPath = '/',
    children,
  }) => 
  
  {
    if (!isAuthenthicated) {
      return <Navigate to={redirectPath} replace />;
    }
  
    return children;
  };
