import { useContext } from "react";
import { AuthContext } from "@/auth";
import { useParams } from "react-router";

import { useGetAssessment } from "@/api";
import { DebugJSON } from "./components/DebugJSON";
import { Button, Col, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

/** AssessmentView page that displays the results of an assessment */
const AssessmentView = ({ isPublic }: { isPublic: boolean }) => {
  const navigate = useNavigate();

  const { keycloak, registered } = useContext(AuthContext)!;
  const { asmtId } = useParams();

  const asmtNumID = asmtId !== undefined ? asmtId : "";

  const qAssessment = useGetAssessment({
    id: asmtNumID,
    token: keycloak?.token || "",
    isRegistered: registered,
    isPublic: isPublic,
  });

  const assessment = qAssessment.data?.assessment_doc;

  return (
    <div>
      {assessment && (
        <div>
          <Row className="cat-view-heading-block border-bottom">
            <Col>
              <h2 className="cat-view-heading text-muted  ">
                {assessment.name}
                <p className="lead cat-view-lead">{assessment.id}</p>
              </h2>
            </Col>
            <Col className="col-md-auto cat-heading-right">
              <span>
                Compliance:{" "}
                <strong>{assessment.result.compliance || "unknown"}</strong>
              </span>
              <span>
                Ranking:{" "}
                <strong>{assessment.result.ranking || "unknown"}</strong>
              </span>
            </Col>
          </Row>
          <Row className="mt-2">
            <hr className="my-2" />
          </Row>
          <Row>
            <Button
              variant="secondary my-4"
              onClick={() => {
                navigate(-1);
              }}
            >
              Back
            </Button>
          </Row>
        </div>
      )}
      ;{/* Debug info here - display assessment json */}
      <DebugJSON assessment={assessment} />
    </div>
  );
};

export default AssessmentView;
