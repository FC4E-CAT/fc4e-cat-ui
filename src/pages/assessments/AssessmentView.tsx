import { useContext } from "react";
import { AuthContext } from "@/auth";
import { useParams } from "react-router";

import { useGetAssessment } from "@/api";
import { DebugJSON } from "./components/DebugJSON";
import { Button, Col, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import imgAssessmentPass from "@/assets/assessment-pass.png";

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
                <p className="lead cat-view-lead fs-6">{assessment.id}</p>
              </h2>
            </Col>
            <Col className="col col-lg-1 ">
              <span className="font-weight-500 text-xs text-gray-500">
                Compliance
              </span>
              {assessment.result.compliance ? (
                <p className="text-center">
                  <img
                    src={imgAssessmentPass}
                    className="text-center m-1"
                    width="60%"
                  />
                </p>
              ) : (
                <p>
                  <span className="fs-6 text-warning bold">unknown</span>
                </p>
              )}
            </Col>
            <Col className="col-md-auto col col-lg-1 text-center">
              <span className="font-weight-500 text-xs text-gray-500">
                Ranking
              </span>
              {assessment.result.ranking ? (
                <p>
                  <span className="fs-1 text-primary bold">
                    {assessment.result.ranking}
                  </span>
                  <span className="fs-6 text-secondary">/10</span>
                </p>
              ) : (
                <p>
                  <span className="fs-6 text-warning bold">unknown</span>
                </p>
              )}
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
