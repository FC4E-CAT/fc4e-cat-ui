import React, { useState } from "react";
import {
  AuthContext,
  type AuthContextProps,
  type NullableKeycloak,
} from "./auth-context";

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
