import { useTranslation } from "react-i18next";
import type { Assessment, AssessmentResult, ResultStats } from "@/types";
import { prettyPrintRanking } from "@/utils";
import styles from "./AssessmentBuilder.module.css";
import { Button, ProgressBar } from "react-bootstrap";

function AssessmentEvalStats({
  evalResult,
  assessmentResult,
  onAssessmentCreate,
  onSaveAssessmentChanges,
  onAssessmentSubmit,
  wizardTabActive,
  currentAssessmentInfo,
}: {
  evalResult: ResultStats;
  assessmentResult: AssessmentResult;
  onAssessmentCreate?: () => void;
  onSaveAssessmentChanges?: () => void;
  onAssessmentSubmit?: () => void;
  wizardTabActive?: boolean;
  currentAssessmentInfo?: Assessment | null;
}) {
  const { t } = useTranslation();

  return (
    <div className={styles["assessment-status-header"]}>
      <div className={styles["status-item"]}>
        <span className={styles["status-label"]}>compliance:</span>
        {assessmentResult.compliance === null ? (
          <span
            className={`${styles["status-badge"]} ${styles["status-unknown"]}`}
          >
            {t("unknown")}
          </span>
        ) : assessmentResult.compliance ? (
          <span className={`${styles["status-badge"]} bg-success`}>
            {t("pass").toUpperCase()}
          </span>
        ) : (
          <span className={`${styles["status-badge"]} bg-danger`}>
            {t("fail").toUpperCase()}
          </span>
        )}
      </div>

      <div className={styles["status-divider"]}></div>

      <div className={styles["status-item"]}>
        <span className={styles["status-label"]}>Ranking:</span>
        <span className={styles["status-value"]}>
          {assessmentResult.ranking !== null
            ? prettyPrintRanking(assessmentResult.ranking)
            : "n/a"}
        </span>
      </div>

      <div className={styles["status-divider"]}></div>

      <div className={styles["status-item-with-progress"]}>
        <div className={styles["status-content"]}>
          <span className={styles["status-label"]}>Mandatory:</span>
          <span className={styles["status-value"]}>
            {evalResult.mandatoryFilled} / {evalResult.totalMandatory}
          </span>
        </div>
        <ProgressBar
          style={{ backgroundColor: "darkgrey", height: "0.6rem" }}
          className="mt-1"
        >
          <ProgressBar
            key="optional-pass"
            variant="success"
            now={
              evalResult.totalMandatory
                ? (evalResult.mandatory / evalResult.totalMandatory) * 100
                : 0
            }
          />
          <ProgressBar
            key="optional-fail"
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

      {evalResult.totalOptional > 0 && (
        <div className={styles["status-item-with-progress"]}>
          <div className={styles["status-content"]}>
            <span className={styles["status-label"]}>Optional:</span>
            <span className={styles["status-value"]}>
              {evalResult.optionalFilled} / {evalResult.totalOptional}
            </span>
          </div>
          <ProgressBar
            style={{
              backgroundColor: "darkgrey",
              height: "0.6rem",
            }}
            className="mt-1"
          >
            <ProgressBar
              key="mandatory-pass"
              variant="success"
              now={
                evalResult.totalOptional
                  ? (evalResult.optional / evalResult.totalOptional) * 100
                  : 0
              }
            />
            <ProgressBar
              key="mandatory-fail"
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
      )}
      <div className="d-flex align-items-center ms-auto">
        {onAssessmentCreate && (
          <Button
            id="create_assessment_button"
            disabled={!wizardTabActive}
            className="ms-5 btn btn-primary px-5"
            onClick={onAssessmentCreate}
          >
            {t("buttons.create")}
          </Button>
        )}
        {onSaveAssessmentChanges && (
          <Button
            id="save_assessment_button"
            disabled={!wizardTabActive}
            className="ms-2 px-3"
            variant="outline-primary"
            onClick={onSaveAssessmentChanges}
          >
            {t("buttons.save_progress")}
          </Button>
        )}
        {onAssessmentSubmit && (
          <Button
            id="submit_assessment_button"
            disabled={
              !(
                currentAssessmentInfo &&
                currentAssessmentInfo.result &&
                currentAssessmentInfo.result.compliance !== null
              )
            }
            className="ms-2 btn btn-primary px-3"
            onClick={onAssessmentSubmit}
          >
            {t("buttons.submit")}
          </Button>
        )}
      </div>
    </div>
  );
}

export default AssessmentEvalStats;
