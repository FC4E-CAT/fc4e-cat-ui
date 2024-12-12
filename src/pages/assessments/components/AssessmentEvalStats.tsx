/**
 * Component to display evaluation statistics
 */
import { AssessmentResult, ResultStats } from "@/types";
import { Row, Col, ProgressBar } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { FaCheckCircle } from "react-icons/fa";

export const AssessmentEvalStats = ({
  evalResult,
  assessmentResult,
}: {
  evalResult: ResultStats;
  assessmentResult: AssessmentResult;
}) => {
  const { t } = useTranslation();
  return (
    <div className="p-0 row">
      <div
        className={`py-2 px-3 m-0 rounded-top ${
          assessmentResult.compliance === null
            ? "cat-eval-unknown"
            : assessmentResult.compliance
              ? "cat-eval-pass"
              : "cat-eval-fail"
        }`}
      >
        <Row>
          <Col>
            <div className="d-flex align-items-center">
              <span className="mt-2">
                <FaCheckCircle className="me-2" />
                {t("compliance")}:
                {assessmentResult.compliance === null ? (
                  <span className="badge bg-secondary ms-2">
                    {t("unknown").toUpperCase()}
                  </span>
                ) : assessmentResult.compliance ? (
                  <span className="badge bg-success ms-2">
                    {t("pass").toUpperCase()}
                  </span>
                ) : (
                  <span className="badge bg-danger ms-2">
                    {t("fail").toUpperCase()}
                  </span>
                )}
              </span>
            </div>
          </Col>
          <Col></Col>
          <Col></Col>
          <Col xs={2}>
            <div className="mb-2">
              <span>
                {t("mandatory")}: {evalResult.mandatoryFilled} /{" "}
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
                      ? (evalResult.mandatory / evalResult.totalMandatory) * 100
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
                  {t("optional")}: {evalResult.optionalFilled} /{" "}
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
                        ? (evalResult.optional / evalResult.totalOptional) * 100
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
      </div>
    </div>
  );
};
