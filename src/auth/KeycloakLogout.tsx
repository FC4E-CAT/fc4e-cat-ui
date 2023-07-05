import { useContext, useEffect } from 'react';
import { Navigate } from "react-router-dom";
import { AuthContext } from './AuthContext';



const KeycloakLogout = () => {
    const { keycloak } = useContext(AuthContext)!;

    useEffect(() => {
        const logout = async () => {
          await keycloak.logout();
        };
    
        logout();
      }, [keycloak]);
    
      return <Navigate to="/" replace={true} />
};

export { KeycloakLogout };