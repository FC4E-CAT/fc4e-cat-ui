import { useContext, useEffect } from 'react';
import { Navigate } from "react-router-dom";
import { AuthContext } from '@/auth';

export const KeycloakLogout = () => {
    const { keycloak } = useContext(AuthContext)!;

    useEffect(() => {
        const logout = async () => {
          // Try redirecting when logging out
          if (keycloak) {
            await keycloak.logout({redirectUri: window.location.origin});
          }
  
        };
    
        logout();
      }, [keycloak]);
    
      return <Navigate to="/" replace={true} />
};