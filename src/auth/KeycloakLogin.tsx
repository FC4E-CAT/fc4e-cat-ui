import { useContext, useEffect } from 'react';
import {
    Navigate
} from "react-router-dom";
import { AuthContext } from './AuthContext';
import Keycloak from 'keycloak-js';
import KeycloakConfig from '../keycloak.json';


const KeycloakLogin = () => {
    const { authenticated, setAuthenticated, keycloak, setKeycloak } = useContext(AuthContext)!;

    useEffect(() => {
        const initializeKeycloak = async () => {
            const keycloakInstance = new Keycloak(KeycloakConfig);
            try {
                const authenticated = await keycloakInstance.init({
                    scope: 'openid voperson_id',
                    onLoad: 'login-required',
                    checkLoginIframe: false,
                    pkceMethod: 'S256'
                });
                setKeycloak(keycloakInstance);
                setAuthenticated(authenticated);
            } catch (error) {
                console.error('Failed to initialize Keycloak:', error);
            }
        };

        initializeKeycloak();
    }, []);
    if (authenticated) {
        return <Navigate to="/profile" replace={true} />;
    }
    else {
        return <></>
    }
};

export { KeycloakLogin };