import React, { useState, useEffect } from 'react';
import Keycloak from 'keycloak-js';
import decode from 'jwt-decode';

const Config = {
  url: 'https://localhost:8080/auth', 
  realm: 'myrealm',
  clientId: 'myclient'
};

const KeycloakLogin = () => {
  const [keycloak, setKeycloak] = useState(null);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const initializeKeycloak = async () => {
      const keycloakInstance = new Keycloak(Config);
      try {
        const authenticated = await keycloakInstance.init({
          scope: 'openid voperson_id',
          onLoad: 'login-required',
          promiseType: 'native',
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

  if (keycloak && authenticated) {
    const jwt = JSON.stringify(decode(keycloak.token));
    return (
      <div>
        <h6>token:</h6>
        <code>{keycloak.token}</code>
        <hr />
        <h6>contents:</h6>
        <code>{jwt}</code>
      </div>
    );
  } else {
    return <div>Press Login to authenticate</div>;
  }
};

export default KeycloakLogin;