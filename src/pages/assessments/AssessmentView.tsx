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
          <Row className="border-bottom">
            <Col>
              <h2 className="text-muted cat-view-heading ">
                Assessment Results
                <p className="lead cat-view-lead">
                  Assessment id:{" "}
                  <strong className="badge bg-secondary">
                    {assessment.id}
                  </strong>
                </p>
              </h2>
            </Col>
          </Row>
          <Row className="mt-2">
            <h5>
              Name: <strong>{assessment.name}</strong>
            </h5>
            <span>
              Actor: <strong>{assessment.actor.name}</strong>
            </span>
            <span>
              Organization: <strong>{assessment.organisation.name}</strong>
            </span>
            <span>
              Subject:{" "}
              <strong>
                {assessment.subject.name} - (type: {assessment.subject.type})
              </strong>
            </span>
            <hr className="my-2" />
            <span>
              Compliance:{" "}
              <strong>{assessment.result.compliance || "unknown"}</strong>
            </span>
            <span>
              Ranking: <strong>{assessment.result.ranking || "unknown"}</strong>
            </span>
            <hr className="my-2" />
            {assessment.principles.map((pri) => (
              <div key={pri.id}>
                <h3 className="mb-0">
                  {pri.id} - {pri.name}
                </h3>
                <small className="text-muted">{pri.description}</small>
                <div className="m-3">
                  {pri.criteria.map((cri) => (
                    <div key={cri.id}>
                      <h4 className="mb-0">
                        {cri.id} - {cri.name} ({cri.imperative})
                      </h4>
                      <small className="text-muted">{cri.description}</small>
                      <div>
                        <span>
                          Result:{" "}
                          <strong>{cri.metric.result || "unknown"}</strong>
                        </span>
                      </div>
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
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </Row>
          {/* Debug info here - display assessment json */}
          <DebugJSON assessment={assessment} />
        </div>
      )}
      <Button
        variant="secondary my-4"
        onClick={() => {
          navigate(-1);
        }}
      >
        Back
      </Button>
    </div>
  );
};

export default AssessmentView;
