import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

function ProtectedRoute({ children }) {
  const { user } = useAuthStore(); // Get the current user from Zustand store
  const navigate = useNavigate();

  useEffect(() => {
    // If the user is not logged in, redirect to login page
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // If the user is logged in, render the children (protected content)
  if (!user) {
    return null; // Don't render anything until the redirect happens
  }

  return children; // Render protected content if user is authenticated
}

export default ProtectedRoute;
