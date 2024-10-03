import { useContext } from "react";
import { AuthContext } from "@/auth";
import { useParams } from "react-router";

import { useGetAssessment } from "@/api";
import { DebugJSON } from "./components/DebugJSON";
import { Button, Card, Col, Row } from "react-bootstrap";
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
                <p className="lead cat-view-lead fs-6 ">{assessment.id}</p>
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
          <Row>
            <Col className="col-sm-3">
              <Card style={{ width: "18rem" }}>
                <Card.Body>
                  <Card.Title>Details</Card.Title>
                  <Card.Text>
                    <p className="media-body pb-3 mb-0 small lh-125 border-bottom border-gray">
                      <strong className="text-gray-dark">Actor:</strong>
                      {assessment.actor.name}
                    </p>
                    <p className="media-body pb-3 mb-0 small lh-125 border-bottom border-gray">
                      <strong className="text-gray-dark">Organization:</strong>
                      {assessment.organisation.name}
                    </p>
                    <p className="media-body pb-3 mb-0 small lh-125 border-bottom border-gray">
                      <strong className="text-gray-dark">Subject:</strong>
                      {assessment.subject.name} - (type:{" "}
                      {assessment.subject.type})
                    </p>
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col className="col-sm-9">
              <Row>
                <div className="card-title h5 py-3">Statistics</div>
                <Col className="text-center col-lg-2">
                  <span className="font-weight-500 text-xs text-gray-500">
                    Principles
                  </span>
                  <p>
                    <span className="fs-1 text-primary bold">9</span>
                  </p>
                </Col>
                <Col className="text-center col-lg-2">
                  <span className="font-weight-500 text-xs text-gray-500">
                    Criteria
                  </span>
                  <p>
                    <span className="fs-1 text-primary bold">9</span>
                  </p>
                </Col>
                <Col className="text-center col-lg-2">
                  <span className="font-weight-500 text-xs text-gray-500">
                    Mandatory
                  </span>
                  <p>
                    <span className="fs-1 text-danger bold">8</span>
                    <span className="fs-6 text-secondary">/10</span>
                  </p>
                </Col>
                <Col className="col-md-auto col col-lg-2  text-center">
                  <span className="font-weight-500 text-xs text-gray-500">
                    Optional
                  </span>
                  <p>
                    <span className="fs-1 text-success bold">8</span>
                    <span className="fs-6 text-secondary">/10</span>
                  </p>
                </Col>
              </Row>
            </Col>
          </Row>
          <Button
            variant="secondary my-4"
            onClick={() => {
              navigate(-1);
            }}
          >
            Back
          </Button>
        </div>
      )}
      {/* Debug info here - display assessment json */}
      <DebugJSON assessment={assessment} />
    </div>
  );
};

export default AssessmentView;
