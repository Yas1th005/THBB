import React from 'react';
import { Navigate } from 'react-router-dom';
import AuthService from '../services/auth.service';

function ProtectedRoute({ children, requiredRole }) {
  const currentUser = AuthService.getCurrentUser();
  
  if (!currentUser) {
    // Not logged in
    return <Navigate to="/signin" />;
  }
  
  // Make sure user and role properties exist
  if (!currentUser.user || !currentUser.user.role) {
    // Invalid user data, redirect to sign in
    AuthService.logout(); // Clear invalid data
    return <Navigate to="/signin" />;
  }
  
  if (requiredRole && currentUser.user.role !== requiredRole) {
    // Wrong role
    switch(currentUser.user.role) {
      case 'admin':
        return <Navigate to="/admin" />;
      case 'delivery':
        return <Navigate to="/delivery" />;
      default:
        return <Navigate to="/home" />;
    }
  }
  
  return children;
}

export default ProtectedRoute;
