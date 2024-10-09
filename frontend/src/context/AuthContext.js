import React, { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Create the AuthContext
export const AuthContext = createContext();

// Create a Provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("current-user");
    if (storedUser) {
      try {
        const parsedUserData = JSON.parse(storedUser);
        if (parsedUserData && parsedUserData.token) {
          setCurrentUser(parsedUserData);
        } else {
          setCurrentUser(null);
        }
      } catch (error) {
        setCurrentUser(null);
      }
    } else {
      setCurrentUser(null);
    }
    setLoading(false);
  }, [navigate]);

  const loginUser = (userData) => {
    setCurrentUser(userData);
    localStorage.setItem("current-user", JSON.stringify(userData));
  };

  const logoutUser = () => {
    setCurrentUser(null);
    localStorage.removeItem("current-user");
  };

  const isAuthenticated = !!(currentUser && currentUser.token); // True if user is not null

  return (
    <AuthContext.Provider
      value={{ loading, currentUser, isAuthenticated, loginUser, logoutUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = () => useContext(AuthContext);
