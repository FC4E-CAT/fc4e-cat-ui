import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useGetProfile } from "@/api";
import { AuthContext } from "@/auth";
import {
  FaPlus,
  FaLock,
  FaCheckCircle,
  FaShieldAlt,
  FaCopy,
  FaUserCircle,
} from "react-icons/fa";
import { UserProfile } from "@/types";
import { idToColor, trimField } from "@/utils/admin";
import { Tooltip, OverlayTrigger, TooltipProps } from "react-bootstrap";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { useTranslation } from "react-i18next";

function Profile() {
  const { t } = useTranslation();
  const { authenticated, keycloak, registered } = useContext(AuthContext)!;
  const [userProfile, setUserProfile] = useState<UserProfile>();

  const { data: profileData } = useGetProfile({
    token: keycloak?.token || "",
    isRegistered: registered,
  });

  useEffect(() => {
    setUserProfile(profileData);
  }, [profileData]);

  const [copySuccess, setCopySuccess] = useState("");

  const renderTooltip = (props: TooltipProps) => (
    <Tooltip id="button-tooltip" {...props}>
      {copySuccess ? t("page_profile.copied") : t("page_profile.copy")}
    </Tooltip>
  );
  // check if the user has details
  const hasDetails =
    (userProfile?.name && userProfile?.surname && userProfile?.name) ||
    userProfile?.user_type === "Admin";

  if (keycloak?.token && authenticated) {
    return (
      <>
        <div className="cat-view-heading-block row border-bottom">
          <div className="col">
            <h2 className="text-muted cat-view-heading">
              {t("page_profile.title")}
            </h2>
          </div>
          <div className="col-md-auto cat-heading-right"></div>
        </div>
        <div className="row">
          <div className="col col-lg-3 border-right  border-dashed">
            <div className="d-flex flex-column align-items-center text-center p-1 py-1">
              <div className="py-3 mt-5">
                <FaUserCircle
                  size={"9rem"}
                  style={{ color: idToColor(userProfile?.id || "black") }}
                />
              </div>
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
              {userProfile?.orcid_id && (
                <div id="orcid">
                  <strong>{t("orcid")}:</strong> {userProfile?.orcid_id}
                </div>
              )}
              {userProfile?.id && (
                <span className="text-black-50">
                  <strong>ID:</strong> {trimField(userProfile.id, 10)}
                  <OverlayTrigger
                    placement="top"
                    delay={{ show: 250, hide: 400 }}
                    overlay={renderTooltip}
                  >
                    <CopyToClipboard
                      text={userProfile.id}
                      onCopy={() => setCopySuccess("Copied!")}
                    >
                      <FaCopy
                        style={{
                          color: "#FF7F50",
                          cursor: "pointer",
                          marginLeft: "10px",
                        }}
                        onMouseLeave={() => setCopySuccess("")}
                      />
                    </CopyToClipboard>
                  </OverlayTrigger>
                </span>
              )}
              <Link
                id="profile-update-button"
                to="/profile/update"
                className="btn btn-lt border-black mt-4"
              >
                {t("buttons.update_details")}
              </Link>
            </div>
          </div>
          <div className="col-md-auto border-right">
            <div className="p-3">
              <div className="row py-3 mt-4">
                <h4>{t("validation_requests")}</h4>
                <section className="col-9 disabled">
                  {!hasDetails && (
                    <div
                      id={"validation-alert-warning"}
                      className="alert alert-warning"
                      role="alert"
                    >
                      <FaLock /> {t("page_profile.validation_requests_alert")}
                    </div>
                  )}
                  {hasDetails && (
                    <>
                      <div>
                        {t("page_profile.validation_requests_subtitle")}
                      </div>
                      <div className="mt-4">
                        <Link
                          id="view_validations_button"
                          to="/validations"
                          className="btn btn-light border-black"
                        >
                          {t("buttons.view_list")}
                        </Link>
                        <Link
                          id="create_validation_button"
                          to="/validations/request"
                          className="btn btn-light border-black mx-3"
                        >
                          <FaPlus /> {t("buttons.create_new")}
                        </Link>
                      </div>
                    </>
                  )}
                </section>
              </div>
              <div className="row border-top py-3 mt-4">
                <h4>{t("assessments")}</h4>
                <section id="assessments_section" className="col-9 disabled">
                  {(userProfile?.user_type === "Validated" ||
                    userProfile?.user_type === "Admin") && (
                    <>
                      <div>{t("page_profile.assessments_subtitle")}</div>
                      <div className="mt-4">
                        <Link
                          id="view_assessments_button"
                          to="/assessments"
                          className="btn btn-light border-black"
                        >
                          {t("buttons.view_list")}
                        </Link>
                        <Link
                          id="create_assessment_button"
                          to="/assessments/create"
                          className="btn btn-light border-black mx-3"
                        >
                          <FaPlus /> {t("buttons.create_new")}
                        </Link>
                      </div>
                    </>
                  )}
                </section>
              </div>
              <div className="row border-top py-3 mt-4">
                <h4>{t("subjects")}</h4>

                <section id="subjects_section" className="col-9 disabled">
                  {(userProfile?.user_type === "Validated" ||
                    userProfile?.user_type === "Admin") && (
                    <>
                      <div>{t("page_profile.subjects_subtitle")}</div>
                      <div className="mt-4">
                        <Link
                          id="view_subjects_button"
                          to="/subjects"
                          className="btn btn-light border-black"
                        >
                          {t("buttons.view_list")}
                        </Link>
                        <Link
                          id="create_subject_button"
                          to="/subjects?create"
                          className="btn btn-light border-black mx-3"
                        >
                          <FaPlus /> {t("buttons.create_new")}
                        </Link>
                      </div>
                    </>
                  )}
                </section>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  } else {
    return <div>{t("page_profile.login_alert")}</div>;
  }
}

export default Profile;
