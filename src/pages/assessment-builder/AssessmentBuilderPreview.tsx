import { FaInfoCircle } from "react-icons/fa";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import {
  AssessmentBuilderState,
  AssessmentPrinciple,
  AssessmentCriterionImperative,
} from "@/types";
import styles from "./AssessmentBuilder.module.css";

interface AssessmentBuilderPreviewProps {
  assessment: AssessmentPrinciple[];
  builderState: AssessmentBuilderState;
  setBuilderState: React.Dispatch<React.SetStateAction<AssessmentBuilderState>>;
}

function AssessmentBuilderPreview({
  assessment,
  builderState,
  setBuilderState,
}: AssessmentBuilderPreviewProps) {
  const { t } = useTranslation();

  return (
    <div className={styles.columnContent}>
      {assessment?.length > 0 ? (
        <div className={styles.builderPreview}>
          {builderState.selectedPrincipleIndex != null &&
          builderState.selectedPrincipleIndex > -1 ? (
            <div
              className={styles.principleWrapper}
              onClick={() =>
                setBuilderState((prevState) => ({
                  ...prevState,
                  entityMode: "principle",
                  formMode: "new",
                }))
              }
            >
              <span className="h5 align-middle">
                Part of Principle{" "}
                {assessment[builderState.selectedPrincipleIndex]?.id}:{" "}
                {assessment[builderState.selectedPrincipleIndex]?.name}
              </span>
              <OverlayTrigger
                placement="top"
                overlay={
                  <Tooltip
                    id={`tip-pri-${
                      builderState.selectedPrincipleIndex &&
                      builderState.selectedPrincipleIndex > -1 &&
                      assessment[builderState.selectedPrincipleIndex]?.id
                    }`}
                  >
                    {
                      assessment[builderState.selectedPrincipleIndex]
                        ?.description
                    }
                  </Tooltip>
                }
              >
                <span className="ms-2 mb-2">
                  <FaInfoCircle className="text-secondary opacity-50 align-middle" />
                </span>
              </OverlayTrigger>
            </div>
          ) : builderState.selectedCriterionIndex == null ||
            builderState.selectedCriterionIndex < 0 ? (
            <div className={styles.previewPlaceholder}>
              <p className="text-muted">
                Please select a criterion from the structure list to see its
                details here.
              </p>
            </div>
          ) : null}

          {builderState.selectedCriterionIndex != null &&
          builderState.selectedCriterionIndex > -1 ? (
            <div>
              <span className="h5 align-middle">
                {
                  assessment[builderState.selectedPrincipleIndex || 0]
                    ?.criteria[builderState.selectedCriterionIndex]?.id
                }
                :{" "}
                {
                  assessment[builderState.selectedPrincipleIndex || 0]
                    ?.criteria[builderState.selectedCriterionIndex]?.name
                }
              </span>
              {assessment[builderState.selectedPrincipleIndex || 0]?.criteria[
                builderState.selectedCriterionIndex
              ]?.imperative === AssessmentCriterionImperative.MUST ? (
                <span className="badge bg-success bg-small ms-4 align-middle">
                  {t("required")}
                </span>
              ) : (
                <span className="badge bg-warning bg-small ms-4 align-middle">
                  {t("optional")}
                </span>
              )}
              <p className="text-muted lh-sm mt-2 mb-2">
                {
                  assessment[builderState.selectedPrincipleIndex || 0]
                    ?.criteria[builderState.selectedCriterionIndex]?.description
                }
              </p>
            </div>
          ) : null}
        </div>
      ) : (
        <div>
          <p className="text-muted">
            No assessment structure defined yet. Please add or select a
            criterion to start building your assessment.
          </p>
        </div>
      )}
    </div>
  );
}

export default AssessmentBuilderPreview;
