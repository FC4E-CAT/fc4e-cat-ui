import { useContext, useEffect } from "react";
import { useQueryClient } from '@tanstack/react-query'
import { Navigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import Keycloak from "keycloak-js";
import KeycloakConfig from "../keycloak.json";
import { UserAPI } from "../api";

const KeycloakLogin = () => {
  const {
    authenticated,
    setAuthenticated,
    keycloak,
    setKeycloak,
    registered,
    setRegistered
  } = useContext(AuthContext)!;

  const {
    data: profileData,
    refetch: getProfile,
    isError: isErrorUserProfile,
    isSuccess,
  } = UserAPI.useGetProfile({
    token: keycloak?.token,
    isRegistered: registered
  });

  const queryClient = useQueryClient()
  
  const { mutateAsync: userRegister, isSuccess: isSuccessRegister } = UserAPI.useUserRegister();

  useEffect(() => {
    const initializeKeycloak = async () => {
      const keycloakInstance = new Keycloak(KeycloakConfig);
      keycloakInstance.onTokenExpired = () => {
        keycloakInstance?.updateToken(5).then(() => {
            setKeycloak(keycloakInstance);
            queryClient.resetQueries();
        });
      };
      try {
        const authenticated = await keycloakInstance.init({
          scope: "openid voperson_id",
          onLoad: "login-required",
          checkLoginIframe: false,
          pkceMethod: "S256",
        });
        setKeycloak(keycloakInstance);
        setAuthenticated(authenticated);
      } catch (error) {
        console.error("Failed to initialize Keycloak:", error);
      }
    };
    initializeKeycloak();
  }, [setAuthenticated, setKeycloak, queryClient]);

  useEffect(() => {
    if (!keycloak?.isTokenExpired(0)) {
      if (authenticated) {
        getProfile();
      }
    }
  }, [authenticated, isSuccessRegister, getProfile, keycloak]);

  useEffect(() => {
    setKeycloak(keycloak);
  });

  useEffect(() => {
    if (isErrorUserProfile) {
      const data: any = { token: keycloak?.token };
      userRegister(data);
    }
  }, [isErrorUserProfile, keycloak, userRegister]);

  useEffect(() => {
    if (isSuccessRegister || profileData) {
      setRegistered(true);
    }
  }, [isSuccessRegister, setRegistered, profileData]);

  if (authenticated && isSuccess) {
    return <Navigate to="/profile" replace={true} />;
  } else {
    return <></>;
  }
};

export { KeycloakLogin };
