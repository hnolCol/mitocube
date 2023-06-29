import React from 'react';
import { Navigate } from 'react-router-dom';

export const MCProtectedRoute = ({
    isAuthenthicated,
    redirectPath = '/login',
    children,
  }) => 
  
  {
    if (!isAuthenthicated) {
      return <Navigate to={redirectPath} replace />;
    }
  
    return children;
  };
