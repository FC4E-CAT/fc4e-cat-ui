import { useContext, useEffect, useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import { Link } from "react-router-dom";
import { UserAPI } from '../api';
import { AuthContext } from '../auth/AuthContext';
import { FaAddressCard, FaPlus } from 'react-icons/fa';


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
        <h3 className="cat-view-heading"><FaAddressCard /> profile</h3>
        <Row>
          <Col md>
            <span style={{'fontSize':'1.4rem'}}><strong>id:</strong> {userProfile?.id}</span>
            <br/>
            <strong>type:</strong> {userProfile?.user_type}
            <br/>
            <strong>registered on:</strong> {userProfile?.registered_on}
          </Col>
          <Col sm>
          <h5>Personal Details:</h5>
          </Col>
        </Row>
        <div className="mt-4">
          <h5>My Validation Requests:</h5>
          <Link to="/validations" className="btn btn-light border-black" >View List</Link>
          <Link to="/validations/request" className="btn btn-light border-black mx-3" ><FaPlus /> Create New</Link>
        </div>

       

      </div>
    );
  } else {
    return <div>Press Login to authenticate</div>;
  }
}

export default Profile;
