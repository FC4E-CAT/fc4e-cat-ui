import { useTranslation } from "react-i18next";
import type { Assessment, AssessmentResult, ResultStats } from "@/types";
import { prettyPrintRanking } from "@/utils";
import styles from "./AssessmentBuilder.module.css";
import { Button } from "react-bootstrap";

function AssessmentEvalStats({
  evalResult,
  assessmentResult,
  onSaveAssessmentChanges,
  onAssessmentSubmit,
  wizardTabActive,
  currentAssessmentInfo,
}: {
  evalResult: ResultStats;
  assessmentResult: AssessmentResult;
  onSaveAssessmentChanges?: () => void;
  onAssessmentSubmit?: () => void;
  wizardTabActive?: boolean;
  currentAssessmentInfo?: Assessment | null;
}) {
  const { t } = useTranslation();

  return (
    <div className={styles["assessment-status-header"]}>
      <div className={styles["status-row"]}>
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
          <div className={styles["status-header"]}>
            <span className={styles["status-label"]}>Mandatory</span>
            <div className={styles["status-summary"]}>
              <span className={styles["status-value-pass"]}>
                {evalResult.mandatory}
              </span>
              <span className={styles["status-separator"]}>/</span>
              <span className={styles["status-total"]}>
                {evalResult.totalMandatory}
              </span>
            </div>
          </div>
          <div className={styles["progress-container"]}>
            <div
              className={styles["progress-segment-pass"]}
              style={{
                width: `${evalResult.totalMandatory ? (evalResult.mandatory / evalResult.totalMandatory) * 100 : 0}%`,
              }}
            />
            <div
              className={styles["progress-segment-fail"]}
              style={{
                width: `${evalResult.totalMandatory ? ((evalResult.mandatoryFilled - evalResult.mandatory) / evalResult.totalMandatory) * 100 : 0}%`,
              }}
            />
            <div
              className={styles["progress-segment-remaining"]}
              style={{
                width: `${evalResult.totalMandatory ? ((evalResult.totalMandatory - evalResult.mandatoryFilled) / evalResult.totalMandatory) * 100 : 100}%`,
              }}
            />
          </div>
          <div className={styles["status-breakdown"]}>
            <span className={styles["status-detail-pass"]}>
              {evalResult.mandatory} passed
            </span>
            <span className={styles["status-detail-fail"]}>
              {evalResult.mandatoryFilled - evalResult.mandatory} failed
            </span>
            {evalResult.totalMandatory - evalResult.mandatoryFilled > 0 && (
              <span className={styles["status-detail-remaining"]}>
                {evalResult.totalMandatory - evalResult.mandatoryFilled}{" "}
                remaining
              </span>
            )}
          </div>
        </div>

        {evalResult.totalOptional > 0 && (
          <div className={styles["status-item-with-progress"]}>
            <div className={styles["status-header"]}>
              <span className={styles["status-label"]}>Optional</span>
              <div className={styles["status-summary"]}>
                <span className={styles["status-value-pass"]}>
                  {evalResult.optional}
                </span>
                <span className={styles["status-separator"]}>/</span>
                <span className={styles["status-total"]}>
                  {evalResult.totalOptional}
                </span>
              </div>
            </div>
            <div className={styles["progress-container"]}>
              <div
                className={styles["progress-segment-pass"]}
                style={{
                  width: `${evalResult.totalOptional ? (evalResult.optional / evalResult.totalOptional) * 100 : 0}%`,
                }}
              />
              <div
                className={styles["progress-segment-fail"]}
                style={{
                  width: `${evalResult.totalOptional ? ((evalResult.optionalFilled - evalResult.optional) / evalResult.totalOptional) * 100 : 0}%`,
                }}
              />
              <div
                className={styles["progress-segment-remaining"]}
                style={{
                  width: `${evalResult.totalOptional ? ((evalResult.totalOptional - evalResult.optionalFilled) / evalResult.totalOptional) * 100 : 100}%`,
                }}
              />
            </div>
            <div className={styles["status-breakdown"]}>
              <span className={styles["status-detail-pass"]}>
                {evalResult.optional} passed
              </span>
              <span className={styles["status-detail-fail"]}>
                {evalResult.optionalFilled - evalResult.optional} failed
              </span>
              {evalResult.totalOptional - evalResult.optionalFilled > 0 && (
                <span className={styles["status-detail-remaining"]}>
                  {evalResult.totalOptional - evalResult.optionalFilled}{" "}
                  remaining
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className={styles["button-container"]}>
        {onSaveAssessmentChanges && (
          <Button
            id="save_assessment_button"
            disabled={!wizardTabActive}
            className="px-3"
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
            className="btn btn-primary px-3"
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
