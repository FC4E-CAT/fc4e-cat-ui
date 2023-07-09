import { useContext, useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import { UserAPI } from '../api';
import { AuthContext } from '../auth/AuthContext';
import { FaAddressCard, FaPlus, FaLock, FaCheckCircle, FaShieldAlt } from 'react-icons/fa';


function Profile() {
  const { authenticated, keycloak, registered } = useContext(AuthContext)!;
  const [userProfile, setUserProfile] = useState<UserProfile>();

  const { data: profileData } = UserAPI.useGetProfile(
    { token: keycloak?.token, isRegistered: registered }
  );

  useEffect(() => {
    setUserProfile(profileData);
  }, [profileData]);

  // check if the user has details
  const hasDetails = (userProfile?.name  && userProfile?.surname  && userProfile?.name ) || userProfile?.user_type === "Admin"


  if (keycloak?.token && authenticated) {
    return (
      <div className="mt-4">
        <h3 className="cat-view-heading"><FaAddressCard /> profile</h3>
        
        <div className="row border-top py-3 mt-4">
          <header className="col-3 h4 text-muted">Account</header>
          <section className="col-9">
            <div><strong>id:</strong> {userProfile?.id}</div>
           
            <div><strong>type:</strong> 
              {userProfile?.user_type === "Identified" &&
                <span className="m-2">{userProfile?.user_type}</span>
              }
              {userProfile?.user_type === "Validated" &&
                <span className="badge bg-success m-2"><FaCheckCircle /> {userProfile?.user_type}</span>
              }
              {userProfile?.user_type === "Admin" &&
                <span className="badge bg-primary m-2"><FaShieldAlt /> {userProfile?.user_type}</span>
              }

            </div>
            
            <div><strong>registered on:</strong> {userProfile?.registered_on}</div>
          </section>
        </div>
        <div className="row border-top py-3 mt-4">
          <header className="col-3 h4 text-muted">Personal Details</header>
          <section className="col-9">
            <div><strong>Name:</strong> {userProfile?.name}</div>
            <div><strong>Surname:</strong> {userProfile?.surname}</div>
            <div><strong>Email:</strong> {userProfile?.email}</div>
            <Link to="/profile/update" className="btn btn-light border-black mt-4" >Update Details</Link>
            
          </section>
        </div>
        <div className="row border-top py-3 mt-4">
          <header className="col-3 h4 text-muted">Validation Requests</header>
          <section className="col-9 disabled">
            
            { !hasDetails && 
            <div className="alert alert-warning" role="alert">
              <FaLock/ > You should update your personal details in order to be able to create validation requests
            </div> 
            } 
            { hasDetails &&
            <>
              <div>View your current validation requests or create a new one.</div>
              <div className="mt-4">
                <Link to="/validations" className="btn btn-light border-black" >View List</Link>
                <Link to="/validations/request" className="btn btn-light border-black mx-3" ><FaPlus /> Create New</Link>
              </div>
            </>
            }
          </section>
        </div>
        <div className="row border-top py-3 mt-4 mb-4">
          <header className="col-3 h4 text-muted">Assesments</header>
          <section className="col-9 disabled">
            
            { !(userProfile?.user_type === "Validated" || userProfile?.user_type === "Admin") && 
            <div className="alert alert-warning" role="alert">
              <FaLock/ > You should be a validated user in order to be able to create assessments
            </div> 
            } 
            { (userProfile?.user_type === "Validated" || userProfile?.user_type === "Admin") &&
            <>
              <div className="text-muted">View your current assesments or create a new one.<br/><span className="badge bg-info">Under construction</span></div>

            </>
            }
          </section>
        </div>
       

      </div>
    );
  } else {
    return <div>Press Login to authenticate</div>;
  }
}

export default Profile;
