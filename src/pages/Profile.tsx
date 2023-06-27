import { useContext, useEffect, useState } from 'react';
import decode from 'jwt-decode';
import { UserAPI } from '../api';
import { AuthContext } from '../auth/AuthContext';

function Profile() {
  const { authenticated, setAuthenticated, keycloak, setKeycloak } = useContext(AuthContext)!;
  const [userProfile, setUserProfile] = useState<UserProfile>();

  useEffect(() => {
    UserAPI.getProfile(keycloak?.token).then(res => {
      setUserProfile(res.data);
    }
    ).catch(error => console.log(error));
  }, [authenticated, keycloak?.token]);

  if (keycloak?.token && authenticated) {
    console.log(keycloak);
    const jwt = JSON.stringify(decode(keycloak.token));
    return (
      <div className="mt-4">
        <h6>Registered on:</h6>
        <code>{userProfile?.registered_on}</code>
        <hr />
        <h6>User type:</h6>
        <code>{userProfile?.user_type}</code>
        <hr />
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
}

export default Profile;
