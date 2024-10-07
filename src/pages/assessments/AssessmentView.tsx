import { useContext } from "react";
import { AuthContext } from "@/auth";
import { useParams } from "react-router";

import { useGetAssessment } from "@/api";
import { DebugJSON } from "./components/DebugJSON";
import { Button, Card, Col, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import imgAssessmentPass from "@/assets/assessment-pass.png";
import Accordion from "react-bootstrap/Accordion";
import { Assessment, AssessmentCriterionImperative } from "@/types";

interface Stats {
  total_principles: number;
  total_criteria: number;
  total_mandatory: number;
  total_optional: number;
  completed_mandatory: number;
  completed_optional: number;
}

// dig through the assessment and collect the completion statistics
function gatherStats(assessment: Assessment | undefined): Stats {
  let total_principles = 0;
  let total_criteria = 0;
  let total_mandatory = 0;
  let total_optional = 0;
  let completed_mandatory = 0;
  let completed_optional = 0;

  if (assessment) {
    total_principles = assessment.principles.length;
    assessment.principles.forEach((pri) => {
      total_criteria += pri.criteria.length;
      pri.criteria.forEach((cri) => {
        if (cri.imperative == AssessmentCriterionImperative.Must) {
          total_mandatory += 1;
          if (cri.metric.result !== null) completed_mandatory = +1;
        } else {
          total_optional += 1;
          if (cri.metric.result !== null) completed_optional = +1;
        }
      });
    });
  }

  return {
    total_principles: total_principles,
    total_criteria: total_criteria,
    total_mandatory: total_mandatory,
    total_optional: total_optional,
    completed_mandatory: completed_mandatory,
    completed_optional: completed_optional,
  };
}

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

  const stats = gatherStats(assessment);

  return (
    <div>
      {assessment && (
        <div>
          <Row className="cat-view-heading-block border-bottom">
            <Col>
              <h2 className="cat-view-heading text-muted  ">
                {assessment.name}
              </h2>
              <p className="lead cat-view-lead fs-6 ">{assessment.id}</p>
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
            <Col></Col>
          </Row>
          <Row className="bg-light">
            <Col className="col-sm-3 py-3">
              <Card>
                <Card.Body>
                  <h5>Details</h5>

                  <p className="media-body pb-3 mb-0 small lh-125 border-bottom border-gray">
                    <strong className="text-gray-dark">Assess for:</strong>
                    EOSC PID Policy
                  </p>
                  <p className="media-body pb-3 mb-0 small lh-125 border-bottom border-gray">
                    <strong className="text-gray-dark">Actor:</strong>
                    {assessment.actor.name}
                  </p>
                  <p className="media-body pb-3 mb-0 small lh-125 border-bottom border-gray">
                    <strong className="text-gray-dark">Organization:</strong>
                    {assessment.organisation.name}
                  </p>
                  <p className="media-body pb-3 mb-0 small lh-125">
                    <strong className="text-gray-dark">Subject:</strong>
                    {assessment.subject.name} - (type: {assessment.subject.type}
                    )
                  </p>
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
                    <span className="fs-1 text-primary bold">
                      {stats.total_principles}
                    </span>
                  </p>
                </Col>
                <Col className="text-center col-lg-2">
                  <span className="font-weight-500 text-xs text-gray-500">
                    Criteria
                  </span>
                  <p>
                    <span className="fs-1 text-primary bold">
                      {stats.total_criteria}
                    </span>
                  </p>
                </Col>
                <Col className="text-center col-lg-2">
                  <span className="font-weight-500 text-xs text-gray-500">
                    Mandatory
                  </span>
                  <p>
                    <span className="fs-1 text-danger bold">
                      {stats.completed_mandatory}
                    </span>
                    <span className="fs-6 text-secondary">
                      /{stats.total_mandatory}
                    </span>
                  </p>
                </Col>
                <Col className="col-md-auto col col-lg-2  text-center">
                  <span className="font-weight-500 text-xs text-gray-500">
                    Optional
                  </span>
                  <p>
                    <span className="fs-1 text-success bold">
                      {stats.completed_optional}
                    </span>
                    <span className="fs-6 text-secondary">
                      /{stats.total_optional}
                    </span>
                  </p>
                </Col>
              </Row>
            </Col>
          </Row>
          <Row className="cat-view-heading-block border-bottom">
            {assessment.principles.map((pri) => (
              <div key={pri.id}>
                <div className="m-3">
                  <h6 className="mb-0">
                    {pri.id} - {pri.name}
                  </h6>
                  <small className="text-muted">{pri.description}</small>
                </div>

                <div className="m-3">
                  <Accordion defaultActiveKey="0">
                    {pri.criteria.map((cri) => (
                      <Accordion.Item eventKey={cri.id} key={cri.id}>
                        <Accordion.Header>
                          {cri.id} - {cri.name}
                          {cri.imperative === "must" ? (
                            <span className="ms-2 badge rounded-pill text-bg-light text-dark">
                              {cri.imperative}
                            </span>
                          ) : (
                            <span className="ms-2 badge rounded-pill text-bg-light text-warning">
                              {cri.imperative}
                            </span>
                          )}
                          {cri.metric.result === 1 ? (
                            <span className="ms-5 align-middle ">
                              <small className="ms-2">
                                <strong>
                                  <span className="text-success">Passed</span>
                                </strong>
                              </small>
                            </span>
                          ) : cri.metric.result === 0 ? (
                            <span className="ms-5 align-middle ">
                              <span className="badge badge-pill bg-danger me-1 flex-1"></span>
                              <small className="ms-2">
                                <strong>
                                  <span className="text-danger">Failed</span>
                                </strong>
                              </small>
                            </span>
                          ) : (
                            <span className="ms-5 align-middle">
                              <small className="ms-2">
                                <strong>
                                  <span className="text-danger">
                                    not answered
                                  </span>
                                </strong>
                              </small>
                            </span>
                          )}
                        </Accordion.Header>
                        <Accordion.Body>
                          <small className="text-muted">
                            {cri.description}
                          </small>

                          <div className="m-3">
                            {cri.metric.tests.map((test) => (
                              <div key={test.id}>
                                <span className="badge rounded-pill text-bg-light text-info">
                                  {test.id} - {test.name}
                                </span>
                                <br />
                                <strong>Q.</strong>
                                {test.text}
                                <br />
                                <strong>A.</strong>
                                {test.result || "n/a"}
                                <br />
                                {test.evidence_url &&
                                  test.evidence_url?.length > 0 && (
                                    <span>
                                      {test.evidence_url.map((ev) => (
                                        <span key={ev.url}>
                                          {" "}
                                          <a href={ev.url}>{ev.url}</a>
                                          {ev.description && (
                                            <span>{ev.description}</span>
                                          )}
                                        </span>
                                      ))}
                                    </span>
                                  )}
                              </div>
                            ))}
                          </div>
                        </Accordion.Body>
                      </Accordion.Item>
                    ))}
                  </Accordion>
                </div>
              </div>
            ))}
            {/* Assessemt Principles for loop */}
          </Row>
          {/* Row of Principles closes*/}
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
