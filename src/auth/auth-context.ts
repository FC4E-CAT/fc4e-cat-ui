import { createContext } from "react";
import Keycloak from "keycloak-js";

export type NullableKeycloak = null | Keycloak;

export interface AuthContextProps {
  authenticated: boolean;
  setAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  registered: boolean;
  setRegistered: React.Dispatch<React.SetStateAction<boolean>>;
  keycloak: NullableKeycloak;
  setKeycloak: React.Dispatch<React.SetStateAction<NullableKeycloak>>;
}

export const AuthContext = createContext<AuthContextProps | null>(null);
