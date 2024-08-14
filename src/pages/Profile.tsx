import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useGetProfile } from "@/api";
import { AuthContext } from "@/auth";
import { FaPlus, FaLock, FaCheckCircle, FaShieldAlt } from "react-icons/fa";
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
      <>
        <div className="container rounded bg-white mt-1 mb-5">
          <div className="row">
            <div className="col-3 border-right border-dashed">
              <div className="d-flex flex-column align-items-center text-center p-1 py-1">
                <img
                  className="rounded-circle mt-5"
                  width="150px"
                  src="https://st3.depositphotos.com/15648834/17930/v/600/depositphotos_179308454-stock-illustration-unknown-person-silhouette-glasses-profile.jpg"
                />
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
                <span className="font-weight-bold">
                  {userProfile?.name} {userProfile?.surname}
                </span>
                <span className="text-black-50">{userProfile?.email}</span>
                <span>
                  <strong>registered on:</strong> {userProfile?.registered_on}
                </span>
                <span>
                  <br />{" "}
                </span>
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
                <p className="font-italic">
                  <i>1fe601..@einfra.grnet.gr</i>(copy icon/svg)
                </p>
                <span> </span>
              </div>
            </div>
            <div className="col-9 border-right">
              <div className="p-3 py-5">
                <header className="h3 text-muted">User Dashboard</header>
                <div className="row border-top py-3 mt-4">
                  <h4>Validation Requests</h4>
                  <section className="col-9 disabled">
                    {!hasDetails && (
                      <div
                        id={"validation-alert-warning"}
                        className="alert alert-warning"
                        role="alert"
                      >
                        <FaLock /> You should update your personal details in
                        order to be able to create validation requests
                      </div>
                    )}
                    {hasDetails && (
                      <>
                        <div>
                          View your current validation requests or create a new
                          one.
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
                <div className="row border-top py-3 mt-4">
                  <h4>Assessments</h4>
                  <section id="assessments_section" className="col-9 disabled">
                    {(userProfile?.user_type === "Validated" ||
                      userProfile?.user_type === "Admin") && (
                      <>
                        <div>
                          View your current assessments or create a new one.
                        </div>
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
                <div className="row border-top py-3 mt-4">
                  <h4>Subjects</h4>

                  <section id="subjects_section" className="col-9 disabled">
                    {(userProfile?.user_type === "Validated" ||
                      userProfile?.user_type === "Admin") && (
                      <>
                        <div>
                          View and manage your current Assessment Subjects
                        </div>
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
          </div>
        </div>
      </>
    );
  } else {
    return <div>Press Login to authenticate</div>;
  }
}

export default Profile;
