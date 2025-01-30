import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    token: null,
    userId: null,
    userEmail: null,
    userName: null,
    isLoading: true,
  });

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedAuth = await AsyncStorage.getItem('auth');
      if (storedAuth) {
        setAuthState({ ...JSON.parse(storedAuth), isLoading: false });
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Error loading auth:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const login = async (userData) => {
    try {
      await AsyncStorage.setItem('auth', JSON.stringify(userData));
      setAuthState({ ...userData, isLoading: false });
    } catch (error) {
      console.error('Error storing auth:', error);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('auth');
      setAuthState({ token: null, userId: null, userEmail: null, userName: null, isLoading: false });
    } catch (error) {
      console.error('Error removing auth:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 