import { useContext } from "react";
import { AuthContext } from "@/auth";
import { useParams } from "react-router";

import { useGetAssessment } from "@/api";
import { DebugJSON } from "./components/DebugJSON";
import { Button, Card, Col, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import imgAssessmentPass from "@/assets/assessment-pass.png";
import Accordion from "react-bootstrap/Accordion";

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
            <col></col>
          </Row>
          <Row className="bg-light">
            <Col className="col-sm-3 py-3">
              <Card>
                <Card.Body>
                  <Card.Title>Details</Card.Title>
                  <Card.Text>
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
                                    not answer
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
                                <h5>
                                  {test.id} - {test.name}
                                </h5>

                                <div className="ms-4 border-start ps-2">
                                  <em>{test.text}</em>
                                </div>
                                <span className="p-2">
                                  Result:{" "}
                                  <strong>{test.result || "unknown"}</strong>
                                </span>
                                {test.evidence_url &&
                                  test.evidence_url?.length > 0 && (
                                    <div>
                                      <h6>Evidence:</h6>
                                      <ul>
                                        {test.evidence_url.map((ev) => (
                                          <li key={ev.url}>
                                            <div>
                                              url: <pre>{ev.url}</pre>
                                            </div>
                                            {ev.description && (
                                              <div>
                                                description:{" "}
                                                <em>{ev.description}</em>
                                              </div>
                                            )}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
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
