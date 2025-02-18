import React, { useContext, useState } from "react";
import { useGetViewUsers } from "@/api";
import { AuthContext } from "@/auth";
import {
  FaCheckCircle,
  FaUserCircle,
  FaCopy,
  FaShieldAlt,
} from "react-icons/fa";
import { FaFileCircleCheck, FaEarlybirds } from "react-icons/fa6";
import { useParams } from "react-router-dom";
import { Tooltip, OverlayTrigger, TooltipProps } from "react-bootstrap";
import { idToColor, trimField } from "@/utils/admin";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { useTranslation } from "react-i18next";

const ViewUsers: React.FC = () => {
  const { authenticated, keycloak, registered } = useContext(AuthContext)!;
  const { id } = useParams<{ id: string }>();

  const { data: profile } = useGetViewUsers({
    id: id || "",
    token: keycloak?.token || "",
    isRegistered: registered || false,
  });

  const [copySuccess, setCopySuccess] = useState("");

  const { t } = useTranslation();

  const renderTooltip = (props: TooltipProps) => (
    <Tooltip id="button-tooltip" {...props}>
      {copySuccess ? t("tip_copied") : t("tip_copy")}
    </Tooltip>
  );
  if (keycloak?.token && authenticated) {
    return (
      <>
        <div className="cat-view-heading-block row border-bottom">
          <div className="col">
            <h2 className="text-muted cat-view-heading">
              {t("page_admin_users.user_details")}
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
                  style={{ color: idToColor(profile?.id || "black") }}
                />
              </div>
              {profile?.user_type === "Identified" && (
                <span id="identified" className="m-2">
                  {profile?.user_type}
                </span>
              )}
              {profile?.user_type === "Validated" && (
                <span id="validated" className="badge bg-success m-2">
                  <FaCheckCircle /> {profile?.user_type}
                </span>
              )}
              {profile?.user_type === "Admin" && (
                <span id="admin" className="badge bg-primary m-2">
                  <FaShieldAlt /> {profile?.user_type}
                </span>
              )}
              <span className="font-weight-bold">
                {profile?.name} {profile?.surname}
              </span>
              <span className="text-black-50">{profile?.email}</span>
              {profile?.orcid_id && (
                <div id="orcid">
                  <strong>{t("orcid")}:</strong> {profile?.orcid_id}
                </div>
              )}
              {profile?.id && (
                <span className="text-black-50">
                  <strong>{t("fields.id").toUpperCase()}:</strong>{" "}
                  {trimField(profile.id, 10)}
                  <OverlayTrigger
                    placement="top"
                    delay={{ show: 250, hide: 400 }}
                    overlay={renderTooltip}
                  >
                    <CopyToClipboard
                      text={profile.id}
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
            </div>
          </div>
          <div className="col-md-auto border-right">
            <div className="p-3">
              <div className="row py-3 mt-4">
                <h4>{t("page_admin_users.user_data")}</h4>

                <div className="col-md-6 col-sm-6 bottom-margin text-center counter-section wow sm-margin-bottom-ten py-3">
                  <FaFileCircleCheck className="medium-icon" />
                  <span
                    id="anim-number-pizza"
                    className="counter-number"
                  ></span>
                  <span className="timer counter alt-font appear">
                    {" "}
                    {profile?.count_of_assessments}
                  </span>
                  <p className="counter-title">
                    # {t("assessments").toUpperCase()}
                  </p>
                </div>
                <div className="col-md-6 col-sm-6 bottom-margin text-center counter-section wow  sm-margin-bottom-ten py-3">
                  <FaEarlybirds className="medium-icon" />
                  <span
                    id="anim-number-pizza"
                    className="counter-number"
                  ></span>
                  <span className="timer counter alt-font appear">
                    {" "}
                    {profile?.count_of_validations}
                  </span>
                  <p className="counter-title">
                    # {t("validations").toUpperCase()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  } else {
    return <div>{t("login_alert")}</div>;
  }
};

export default ViewUsers;
