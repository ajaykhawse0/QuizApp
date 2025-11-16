import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

useEffect(() => {
  const initializeAuth = async () => {
    try {
      const response = await authAPI.getCurrentUser();

      if (response.data.user) {
        setUser(response.data.user);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      } else {
        setUser(null);
        localStorage.removeItem('user');
      }
    } catch (err) {
      setUser(null);
      localStorage.removeItem('user');
    }

    setLoading(false);
  };

  initializeAuth();
}, []);



  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      const { token: newToken, user: userData } = response.data;
      
      if (!userData) {
        // Fallback: try to get user info from /me endpoint
        try {
          const userResponse = await authAPI.getCurrentUser();
          if (userResponse.data.user) {
            const updatedUser = userResponse.data.user;
            setToken(newToken);
            setUser(updatedUser);
            localStorage.setItem('token', newToken);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            return { success: true };
          }
        } catch (err) {
          // If /me fails, use basic user data
          const fallbackUser = { email, name: email.split('@')[0], role: 'user' };
          setToken(newToken);
          setUser(fallbackUser);
          localStorage.setItem('token', newToken);
          localStorage.setItem('user', JSON.stringify(fallbackUser));
          return { success: true };
        }
      }
      
      setToken(newToken);
      setUser(userData);
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
      };
    }
  };

const signup = async (name, email, password) => {
  try {
    const response = await authAPI.signup({ name, email, password });

    
    return {
      success: true,
      message: response.data.message || "Account created successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Signup failed",
    };
  }
};

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  };
   

  const isAdmin = user?.role === 'admin'||user?.role === 'superadmin';

  const value = {
    user,
    token,
    loading,
    login,
    signup,
    logout,
    isAdmin,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

