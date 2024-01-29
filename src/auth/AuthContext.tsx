import React, { createContext, useState } from "react";
import Keycloak from "keycloak-js";

interface AuthContextProps {
  authenticated: boolean;
  setAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  registered: boolean;
  setRegistered: React.Dispatch<React.SetStateAction<boolean>>;
  keycloak: NullableKeycloak; // Replace 'any' with the appropriate type for your keycloak object
  setKeycloak: React.Dispatch<React.SetStateAction<NullableKeycloak>>;
}

// Create the context
export const AuthContext = createContext<AuthContextProps | null>(null);

type NullableKeycloak = null | Keycloak;

// Create a provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [keycloak, setKeycloak] = useState<NullableKeycloak>(null);

  const authContextValue: AuthContextProps = {
    authenticated,
    setAuthenticated,
    registered,
    setRegistered,
    keycloak,
    setKeycloak,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
}
