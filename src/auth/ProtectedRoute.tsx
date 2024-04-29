import { useContext, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { AuthContext } from "@/auth";
import Keycloak from "keycloak-js";
import KeycloakConfig from "@/keycloak.json";
import { useUserRegister, useGetProfile } from "@/api";

export function ProtectedRoute() {
  const {
    authenticated,
    setAuthenticated,
    keycloak,
    setKeycloak,
    registered,
    setRegistered,
  } = useContext(AuthContext)!;

  const {
    data: profileData,
    refetch: getProfile,
    isError: isErrorUserProfile,
    isSuccess,
  } = useGetProfile({
    token: keycloak?.token || "",
    isRegistered: registered,
  });

  const { mutateAsync: userRegister, isSuccess: isSuccessRegister } =
    useUserRegister();

  useEffect(() => {
    const initializeKeycloak = async () => {
      const keycloakInstance = new Keycloak(KeycloakConfig);
      try {
        if (!authenticated) {
          const authenticated = await keycloakInstance.init({
            scope: "openid voperson_id",
            onLoad: "login-required",
            checkLoginIframe: false,
            pkceMethod: "S256",
          });
          keycloakInstance.onTokenExpired = () => {
            keycloakInstance.updateToken(5);
          };
          setKeycloak(keycloakInstance);
          setAuthenticated(authenticated);
        }
      } catch (error) {
        console.error("Failed to initialize Keycloak:", error);
      }
    };

    initializeKeycloak();
  }, [authenticated, setAuthenticated, setKeycloak]);

  useEffect(() => {
    if (keycloak?.token) {
      if (authenticated) {
        getProfile();
      }
    }
  }, [authenticated, isSuccessRegister, getProfile, keycloak]);

  useEffect(() => {
    if (isErrorUserProfile) {
      const data: string = keycloak?.token || "";
      userRegister(data);
    }
  }, [isErrorUserProfile, keycloak, userRegister]);

  useEffect(() => {
    if (isSuccessRegister || profileData) {
      setRegistered(true);
    }
  }, [isSuccessRegister, setRegistered, profileData]);

  if (authenticated && isSuccess) {
    return <Outlet />;
  } else {
    return <></>;
  }
}
