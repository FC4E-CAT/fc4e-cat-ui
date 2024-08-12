import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useGetProfile } from "@/api";
import { AuthContext } from "@/auth";
import {
  FaAddressCard,
  FaPlus,
  FaLock,
  FaCheckCircle,
  FaShieldAlt,
} from "react-icons/fa";
import { UserProfile } from "@/types";

function Profile() {
  const { authenticated, keycloak, registered } = useContext(AuthContext)!;
  const [userProfile, setUserProfile] = useState<UserProfile>();

  const { data: profileData } = useGetProfile({
    token: keycloak?.token || "",
    isRegistered: registered,
  });

  useEffect(() => {
    setUserProfile(profileData);
  }, [profileData]);

  // check if the user has details
  const hasDetails =
    (userProfile?.name && userProfile?.surname && userProfile?.name) ||
    userProfile?.user_type === "Admin";

  if (keycloak?.token && authenticated) {
    return (
      <div className="mt-4">
        <h3 className="cat-view-heading">
          <FaAddressCard /> profile
        </h3>

        <div className="row border-top py-3 mt-4">
          <div className="col-3">asdsad</div>
          <div className="col-9">
            <header className="col-3 h4 text-muted">Account</header>
            <section className="col-9">
              <div>
                <strong>id: </strong>
                <span id="user-id">{userProfile?.id}</span>
              </div>
              <div>
                <strong>type:</strong>
                {userProfile?.user_type === "Identified" && (
                  <span id="identified" className="m-2">
                    {userProfile?.user_type}
                  </span>
                )}
                {userProfile?.user_type === "Validated" && (
                  <span id="validated" className="badge bg-success m-2">
                    <FaCheckCircle /> {userProfile?.user_type}
                  </span>
                )}
                {userProfile?.user_type === "Admin" && (
                  <span id="admin" className="badge bg-primary m-2">
                    <FaShieldAlt /> {userProfile?.user_type}
                  </span>
                )}
              </div>

              <div>
                <strong>registered on:</strong> {userProfile?.registered_on}
              </div>
            </section>
          </div>
          <div className="row border-top py-3 mt-4">
            <header className="col-3 h4 text-muted">Personal Details</header>
            <section className="col-9">
              <div id="name">
                <strong>Name:</strong> {userProfile?.name}
              </div>
              <div id="surname">
                <strong>Surname:</strong> {userProfile?.surname}
              </div>
              <div id="email">
                <strong>Email:</strong> {userProfile?.email}
              </div>
              {userProfile?.orcid_id && (
                <div id="orcid">
                  <strong>ORCID:</strong> {userProfile?.orcid_id}
                </div>
              )}
              <Link
                id="profile-update-button"
                to="/profile/update"
                className="btn btn-light border-black mt-4"
              >
                Update Details
              </Link>
            </section>
          </div>
          <div className="row border-top py-3 mt-4">
            <header className="col-3 h4 text-muted">Validation Requests</header>
            <section className="col-9 disabled">
              {!hasDetails && (
                <div
                  id={"validation-alert-warning"}
                  className="alert alert-warning"
                  role="alert"
                >
                  <FaLock /> You should update your personal details in order to
                  be able to create validation requests
                </div>
              )}
              {hasDetails && (
                <>
                  <div>
                    View your current validation requests or create a new one.
                  </div>
                  <div className="mt-4">
                    <Link
                      id="view_validations_button"
                      to="/validations"
                      className="btn btn-light border-black"
                    >
                      View List
                    </Link>
                    <Link
                      id="create_validation_button"
                      to="/validations/request"
                      className="btn btn-light border-black mx-3"
                    >
                      <FaPlus /> Create New
                    </Link>
                  </div>
                </>
              )}
            </section>
          </div>
          <div className="row border-top py-3 mt-4 mb-4">
            <header className="col-3 h4 text-muted">Assessments</header>
            <section id="assessments_section" className="col-9 disabled">
              {(userProfile?.user_type === "Validated" ||
                userProfile?.user_type === "Admin") && (
                <>
                  <div>View your current assessments or create a new one.</div>
                  <div className="mt-4">
                    <Link
                      id="view_assessments_button"
                      to="/assessments"
                      className="btn btn-light border-black"
                    >
                      View List
                    </Link>
                    <Link
                      id="create_assessment_button"
                      to="/assessments/create"
                      className="btn btn-light border-black mx-3"
                    >
                      <FaPlus /> Create New
                    </Link>
                  </div>
                </>
              )}
            </section>
          </div>
          <div className="row border-top py-3 mt-4 mb-4">
            <header className="col-3 h4 text-muted">Subjects</header>
            <section id="subjects_section" className="col-9 disabled">
              {(userProfile?.user_type === "Validated" ||
                userProfile?.user_type === "Admin") && (
                <>
                  <div>View and manage your current Assessment Subjects</div>
                  <div className="mt-4">
                    <Link
                      id="view_subjects_button"
                      to="/subjects"
                      className="btn btn-light border-black"
                    >
                      View List
                    </Link>
                    <Link
                      id="create_subject_button"
                      to="/subjects?create"
                      className="btn btn-light border-black mx-3"
                    >
                      <FaPlus /> Create New
                    </Link>
                  </div>
                </>
              )}
            </section>
          </div>
        </div>
      </div>
    );
  } else {
    return <div>Press Login to authenticate</div>;
  }
}

export default Profile;
