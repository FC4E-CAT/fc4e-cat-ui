import { useContext, useEffect } from 'react';
import { Outlet } from "react-router-dom";
import { AuthContext } from './AuthContext';
import Keycloak from "keycloak-js";
import KeycloakConfig from "../keycloak.json";
import { UserAPI } from "../api";

function ProtectedRoute() {
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

  const { mutateAsync: userRegister, isSuccess: isSuccessRegister } = UserAPI.useUserRegister();

  useEffect(() => {
    const initializeKeycloak = async () => {
      const keycloakInstance = new Keycloak(KeycloakConfig);
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
  }, [setAuthenticated, setKeycloak]);

  useEffect(() => {
    if (keycloak?.token) {
      if (authenticated) {
        getProfile();
      }
    }
  }, [authenticated, isSuccessRegister, getProfile, keycloak]);

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
    return <Outlet />
  } else {
    return <></>;
  }
}


export { ProtectedRoute };
