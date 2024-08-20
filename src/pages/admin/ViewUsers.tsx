import React, { useContext, useState } from "react";
import { useGetViewUsers } from "@/api";
import { AuthContext } from "@/auth";
import {
  FaUser,
  FaCheckCircle,
  FaClipboardList,
  FaUserCircle,
  FaIdBadge,
  FaMailBulk,
  FaCopy,
  FaEnvelope,
} from "react-icons/fa";
import { useParams } from "react-router-dom";
import {
  Col,
  Row,
  Tooltip,
  OverlayTrigger,
  TooltipProps,
} from "react-bootstrap";
import { idToColor, trimField } from "@/utils/admin";
import { CopyToClipboard } from "react-copy-to-clipboard";

const ViewUsers: React.FC = () => {
  const { keycloak, registered } = useContext(AuthContext)!;
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

  return (
    <div className="mb-4">
      <h4>
        <FaUser />
        <strong className="align-middle m-1">View User Details</strong>
      </h4>
      {profile && (
        <div className="mt-4">
          <Row>
            <Col>
              {id && (
                <FaUserCircle size={"8rem"} style={{ color: idToColor(id) }} />
              )}
              <br />
              <br />
              <p>
                <FaUserCircle className="me-2" /> <strong>Name:</strong>{" "}
                {profile.name}{" "}
                <span className="ms-4">
                  <strong>Surname:</strong>{" "}
                  <span className="ms-1">{profile.surname}</span>
                </span>
              </p>

              <p>
                <FaMailBulk className="me-2" /> <strong>Email:</strong>{" "}
                {profile.email}
                <a
                  href={`mailto:${profile.email}`}
                  style={{ marginLeft: "10px", color: "black" }}
                >
                  <FaEnvelope style={{ cursor: "pointer" }} />
                </a>
              </p>
              <p>
                <FaIdBadge className="me-2" /> <strong>ID:</strong>{" "}
                {trimField(profile.id, 20)}
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
                      style={{ cursor: "pointer", marginLeft: "10px" }}
                      onMouseLeave={() => setCopySuccess("")}
                    />
                  </CopyToClipboard>
                </OverlayTrigger>
              </p>
              <p>
                <FaClipboardList className="me-2" />{" "}
                <strong>Number of Assessments:</strong>{" "}
                {profile.count_of_assessments}
              </p>
              <p>
                <FaCheckCircle className="me-2" />{" "}
                <strong>Number of Validations:</strong>{" "}
                {profile.count_of_validations}
              </p>
            </Col>
          </Row>
        </div>
      )}
    </div>
  );
};

export default ViewUsers;
