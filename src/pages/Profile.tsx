import { useContext, useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import { UserAPI } from '../api';
import { AuthContext } from '../auth/AuthContext';

function Profile() {
  const { authenticated, keycloak, registered } = useContext(AuthContext)!;
  const [userProfile, setUserProfile] = useState<UserProfile>();

  const { data: profileData } = UserAPI.useGetProfile(
    { token: keycloak?.token, isRegistered: registered }
  );

  useEffect(() => {
    setUserProfile(profileData);
  }, [profileData]);

  if (keycloak?.token && authenticated) {
    return (
      <div className="mt-4">
        <h6>Registered on:</h6>
        <code>{userProfile?.registered_on}</code>
        <hr />
        <h6>User type:</h6>
        <code>{userProfile?.user_type}</code>
        <Link to="/validations/request" className="btn btn-primary" >Request validation</Link>
        <hr />
      </div>
    );
  } else {
    return <div>Press Login to authenticate</div>;
  }
}

export default Profile;
