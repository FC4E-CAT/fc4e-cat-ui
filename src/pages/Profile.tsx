import { useContext, useEffect, useState } from 'react';
import { UserAPI } from '../api';
import { AuthContext } from '../auth/AuthContext';

function Profile() {
  const { authenticated, keycloak, registered } = useContext(AuthContext)!;
  const [userProfile, setUserProfile] = useState<UserProfile>();

  const { data } = UserAPI.useGetProfile(
    { token: keycloak?.token, isRegistered: registered }
  );

  useEffect(() => {
    setUserProfile(data);
  }, [data]);

  if (keycloak?.token && authenticated) {
    return (
      <div className="mt-4">
        <h6>Registered on:</h6>
        <code>{userProfile?.registered_on}</code>
        <hr />
        <h6>User type:</h6>
        <code>{userProfile?.user_type}</code>
        <hr />
      </div>
    );
  } else {
    return <div>Press Login to authenticate</div>;
  }
}

export default Profile;
