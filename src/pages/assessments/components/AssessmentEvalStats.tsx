/**
 * Component to display evaluation statistics
 */
import { AssessmentResult, ResultStats } from "@/types";
import { Row, Col, Alert, ProgressBar } from "react-bootstrap";
import { FaCheckCircle, FaChartLine } from "react-icons/fa";

export const AssessmentEvalStats = ({
  evalResult,
  assessmentResult,
}: {
  evalResult: ResultStats;
  assessmentResult: AssessmentResult;
}) => {
  return (
    <Row>
      <Col>
        <Alert
          variant={
            evalResult.mandatoryFilled !== evalResult.totalMandatory
              ? "secondary"
              : assessmentResult.compliance
              ? "success"
              : "danger"
          }
        >
          <Row>
            <Col>
              <span>
                <FaCheckCircle className="me-2" />
                Compliance:
                {evalResult.mandatoryFilled !== evalResult.totalMandatory ? (
                  <span className="badge bg-secondary ms-2">UNKNOWN</span>
                ) : assessmentResult.compliance ? (
                  <span className="badge bg-success ms-2">PASS</span>
                ) : (
                  <span className="badge bg-danger ms-2">FAIL</span>
                )}
              </span>
            </Col>
            <Col>
              <span>
                <FaChartLine className="me-2" />
                Ranking:
              </span>{" "}
              {assessmentResult.ranking}
            </Col>
            <Col></Col>
            <Col xs={2}>
              <div className="mb-2">
                <span>
                  Mandatory: {evalResult.mandatoryFilled} /{" "}
                  {evalResult.totalMandatory}
                </span>
                <ProgressBar
                  style={{ backgroundColor: "darkgrey", height: "0.6rem" }}
                  className="mt-1"
                >
                  <ProgressBar
                    key="mandatory-pass"
                    variant="success"
                    now={
                      evalResult.totalMandatory
                        ? (evalResult.mandatory / evalResult.totalMandatory) *
                          100
                        : 0
                    }
                  />
                  <ProgressBar
                    key="mandatory-fail"
                    variant="danger"
                    now={
                      evalResult.totalMandatory
                        ? ((evalResult.mandatoryFilled - evalResult.mandatory) /
                            evalResult.totalMandatory) *
                          100
                        : 0
                    }
                  />
                </ProgressBar>
              </div>
            </Col>
            {evalResult.totalOptional > 0 && (
              <Col xs={2}>
                <div className="mb-2">
                  <span>
                    Optional: {evalResult.optionalFilled} /{" "}
                    {evalResult.totalOptional}
                  </span>
                  <ProgressBar
                    style={{
                      backgroundColor: "darkgrey",
                      height: "0.6rem",
                    }}
                    className="mt-1"
                  >
                    <ProgressBar
                      key="mandatory-pass"
                      striped
                      variant="success"
                      now={
                        evalResult.totalOptional
                          ? (evalResult.optional / evalResult.totalOptional) *
                            100
                          : 0
                      }
                    />
                    <ProgressBar
                      key="mandatory-fail"
                      striped
                      variant="danger"
                      now={
                        evalResult.totalOptional
                          ? ((evalResult.optionalFilled - evalResult.optional) /
                              evalResult.totalOptional) *
                            100
                          : 0
                      }
                    />
                  </ProgressBar>
                </div>
              </Col>
            )}
          </Row>
        </Alert>
      </Col>
    </Row>
  );
};
