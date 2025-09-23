import React, { useState, useCallback } from "react";
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

  const refreshUserToken = useCallback(async () => {
    if (!keycloak) {
      return Promise.reject(new Error("Keycloak instance not available"));
    }

    try {
      // Force token refresh with minValidity of -1 to ensure fresh token. This forces refresh regardless of current token validity
      const refreshed = await keycloak.updateToken(-1);

      if (refreshed) {
        setKeycloak(keycloak);
      }
      return Promise.resolve();
    } catch (error) {
      console.error("Token refresh failed:", error);
      return Promise.reject(error);
    }
  }, [keycloak, setKeycloak]);

  const authContextValue: AuthContextProps = {
    authenticated,
    setAuthenticated,
    registered,
    setRegistered,
    keycloak,
    setKeycloak,
    refreshUserToken,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
}
