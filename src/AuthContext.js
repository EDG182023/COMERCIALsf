import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

// Función simple para simular un token
const generateToken = (username) => {
  return btoa(JSON.stringify({ username, exp: Date.now() + 3600000 })); // Expira en 1 hora
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = (username, password) => {
    // Simulación de autenticación
    if (username === 'admin' && password === 'password') {
      const token = generateToken(username);
      localStorage.setItem('token', token);
      setUser({ username });
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);