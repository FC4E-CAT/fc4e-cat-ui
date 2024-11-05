import { useContext, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "@/auth";
import Keycloak from "keycloak-js";
import KeycloakConfig from "@/keycloak.json";
import { useUserRegister, useGetProfile } from "@/api";
import AdminMenu from "@/components/AdminMenu";

export function ProtectedRoute() {
  // check if the current path leads to an admin-view
  const adminRoute = useLocation().pathname.startsWith("/admin");

  // load navigate hook to use it to programmaticaly navigate to profile page if needed
  const navigate = useNavigate();

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
          // check every 60 seconds if token needs refreshing
          setInterval(() => {
            keycloakInstance
              .updateToken(80) // if token expires in 80 seconds please refresh
              .then((refreshed) => {
                if (refreshed) {
                  setKeycloak(keycloakInstance);
                }
              })
              .catch(() => {
                // if any issues during refresh try login
                keycloakInstance.login();
              });
          }, 60000);
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

  // check if a non-admin user tries to access an admin view
  useEffect(() => {
    if (authenticated && adminRoute && profileData) {
      if (profileData.user_type.toLowerCase() !== "admin") navigate("/profile");
    }
  }, [authenticated, adminRoute, profileData, navigate]);

  if (authenticated && isSuccess && profileData) {
    return adminRoute ? (
      <div className="d-flex flex-row flex-min-boby">
        <div className="p-4 my-4 mb-5 flex-min-menu">&nbsp;</div>
        <div className="bg-light p-4 my-4 mb-5 flex-min-menu">
          <div className="rounded flex-min-menu">
            <AdminMenu />
          </div>
        </div>
        <div className="d-flex flex-column  flex-min-boby">
          <div className="container rounded bg-white mt-1 mb-4 flex-min-boby">
            <Outlet />
          </div>
        </div>
      </div>
    ) : (
      <div className="container rounded bg-white mt-1 mb-5">
        <Outlet />
      </div>
    );
  } else {
    return <></>;
  }
}
