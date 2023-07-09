import React, { createContext, useState } from 'react';

interface AuthContextProps {
  authenticated: boolean;
  setAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  registered: boolean;
  setRegistered: React.Dispatch<React.SetStateAction<boolean>>;
  keycloak: any; // Replace 'any' with the appropriate type for your keycloak object
  setKeycloak: React.Dispatch<React.SetStateAction<any>>;
}

// Create the context
export const AuthContext = createContext<AuthContextProps | null>(null);

// Create a provider component
export function AuthProvider({ children }: any) {
  const [authenticated, setAuthenticated] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [keycloak, setKeycloak] = useState(null);

  const authContextValue: AuthContextProps = {
    authenticated,
    setAuthenticated,
    registered,
    setRegistered,
    keycloak,
    setKeycloak,
  };

  return (
    <AuthContext.Provider
      value={authContextValue}
    >
      {children}
    </AuthContext.Provider>
  );
}