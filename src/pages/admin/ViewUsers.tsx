import React, { useContext, useState } from "react";
import { useGetViewUsers } from "@/api";
import { AuthContext } from "@/auth";
import {
  FaCheckCircle,
  FaUserCircle,
  FaCopy,
  FaShieldAlt,
} from "react-icons/fa";
import { useParams } from "react-router-dom";
import { Tooltip, OverlayTrigger, TooltipProps } from "react-bootstrap";
import { idToColor, trimField } from "@/utils/admin";
import { CopyToClipboard } from "react-copy-to-clipboard";

const ViewUsers: React.FC = () => {
  const { authenticated, keycloak, registered } = useContext(AuthContext)!;
  const { id } = useParams<{ id: string }>();

  const { data: profile } = useGetViewUsers({
    id: id || "",
    token: keycloak?.token || "",
    isRegistered: registered || false,
  });

  const [copySuccess, setCopySuccess] = useState("");

  const renderTooltip = (props: TooltipProps) => (
    <Tooltip id="button-tooltip" {...props}>
      {copySuccess ? "Copied!" : "Copy to clipboard"}
    </Tooltip>
  );
  if (keycloak?.token && authenticated) {
    return (
      <>
        <div className="cat-view-heading-block row border-bottom">
          <div className="col">
            <h2 className="text-muted cat-view-heading"> User Dashboard</h2>
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
                  <strong>ORCID:</strong> {profile?.orcid_id}
                </div>
              )}
              {profile?.id && (
                <span className="text-black-50">
                  <strong>ID:</strong> {trimField(profile.id, 10)}
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
            <h4>User Data</h4>
            <div className="row">
              <div className="col-md-3 col-sm-6 bottom-margin text-center counter-section wow fadeInUp sm-margin-bottom-ten animated">
                <i className="fa fa-beer medium-icon"></i>
                <span id="anim-number-pizza" className="counter-number"></span>
                <span className="timer counter alt-font appear">
                  {" "}
                  {profile?.count_of_assessments}
                </span>
                <p className="counter-title"># Assessments</p>
              </div>
              <div className="col-md-3 col-sm-6 bottom-margin text-center counter-section wow fadeInUp sm-margin-bottom-ten animated">
                <i className="fa fa-beer medium-icon"></i>
                <span id="anim-number-pizza" className="counter-number"></span>
                <span className="timer counter alt-font appear">
                  {" "}
                  {profile?.count_of_validations}
                </span>
                <p className="counter-title"># Validations</p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  } else {
    return <div>Press Login to authenticate</div>;
  }
};

export default ViewUsers;
