import { useContext, useEffect, useState } from "react";
import {
  AssessmentCriterionImperative,
  type Assessment,
  type AssessmentBuilderState,
  type AssessmentPrinciple,
  type Criterion,
} from "@/types";
import {
  FaFileAlt,
  FaFolder,
  FaChevronDown,
  FaChevronUp,
  FaTrash,
  FaExclamationCircle,
  FaTimesCircle,
  FaCheckCircle,
} from "react-icons/fa";
import AssessmentBuilderDeleteModal from "./AssessmentBuilderDeleteModal";
import { isCriterionCompleted } from "./utils";
import { AuthContext } from "@/auth";
import styles from "./AssessmentBuilder.module.css";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import {
  useGetMotivationActorCriteria,
  useUpdateActorCriteriaWithDefaultMetric,
} from "@/api";
import { useTranslation } from "react-i18next";

function AssessmentBuilderStructure({
  mtvId,
  actId,
  setBuilderState,
  assessment,
  setAssessment,
  setAssessmentInfo,
  selectedId,
  allCriteria,
  hasUnsavedChanges,
  isEditing,
  refetchCriteria,
}: {
  mtvId: string;
  actId: string;
  setBuilderState: React.Dispatch<React.SetStateAction<AssessmentBuilderState>>;
  assessment: AssessmentPrinciple[];
  setAssessment: React.Dispatch<React.SetStateAction<AssessmentPrinciple[]>>;
  setAssessmentInfo: React.Dispatch<
    React.SetStateAction<Assessment | undefined>
  >;
  selectedId?: string;
  allCriteria: Criterion[];
  hasUnsavedChanges?: boolean;
  isEditing?: boolean;
  refetchCriteria: () => void;
}) {
  const { keycloak, registered } = useContext(AuthContext)!;
  const { t } = useTranslation();
  const [collapsedPrinciples, setCollapsedPrinciples] = useState<Set<string>>(
    new Set(),
  );
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [criterionToDelete, setCriterionToDelete] = useState<{
    principleIndex: number;
    criterionIndex: number;
    criterionId: string;
    criterionName: string;
  } | null>(null);

  const [showUnsavedChangesModal, setShowUnsavedChangesModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] =
    useState<AssessmentBuilderState | null>({
      formMode: "none",
      entityMode: "none",
      selectedId: "",
      selectedPrincipleIndex: -1,
      selectedCriterionIndex: -1,
    });

  const [selectedCriteria, setSelectedCriteria] = useState<Criterion[]>([]);

  const assignCriteriaToActorMutation = useUpdateActorCriteriaWithDefaultMetric(
    keycloak?.token || "",
    mtvId || "",
    actId || "",
  );

  const {
    data: motivationCriteria,
    fetchNextPage: selCriFetchNextPage,
    hasNextPage: selCriHasNextPage,
  } = useGetMotivationActorCriteria(mtvId || "", actId || "", {
    size: 5,
    token: keycloak?.token || "",
    isRegistered: registered,
  });

  useEffect(() => {
    let tmpSelCri: Criterion[] = [];
    if (motivationCriteria?.pages) {
      motivationCriteria.pages.map((page) => {
        tmpSelCri = [...tmpSelCri, ...page.content];
      });
      if (selCriHasNextPage) {
        selCriFetchNextPage();
      }
    }
    setSelectedCriteria(tmpSelCri);
  }, [motivationCriteria, selCriHasNextPage, selCriFetchNextPage]);

  // Ensure untagged principle is always at the last position
  useEffect(() => {
    if (assessment && assessment.length > 0) {
      const untaggedIndex = assessment.findIndex(
        (principle) => principle.id === "untagged" || principle.id === "",
      );

      if (untaggedIndex !== -1 && untaggedIndex !== assessment.length - 1) {
        const reorderedAssessment = [...assessment];
        const untaggedPrinciple = reorderedAssessment.splice(
          untaggedIndex,
          1,
        )[0];
        reorderedAssessment.push(untaggedPrinciple);
        if (isEditing) {
          setAssessment(reorderedAssessment);
        } else {
          setAssessmentInfo((prev: Assessment | undefined) => {
            if (!prev) return prev;
            return {
              ...prev,
              principles: reorderedAssessment,
            };
          });
        }
      }
    }
  }, [assessment, setAssessment, setAssessmentInfo, isEditing]);

  // Update selectedPrincipleIndex and selectedCriterionIndex when assessment or selectedId changes
  useEffect(() => {
    if (!selectedId || !assessment) {
      return;
    }
    // Find the current indices for the selected criterion
    for (const [principleIndex, principle] of assessment.entries()) {
      if (principle?.criteria) {
        for (const [
          criterionIndex,
          criterion,
        ] of principle.criteria.entries()) {
          if (criterion.id?.toLowerCase() === selectedId?.toLowerCase()) {
            // Update the builder state with correct indices
            setBuilderState({
              entityMode: "criterion",
              formMode: "edit",
              selectedId: selectedId,
              selectedPrincipleIndex: principleIndex,
              selectedCriterionIndex: criterionIndex,
            });
            return;
          }
        }
      }
    }
  }, [assessment, selectedId, setBuilderState]);

  const togglePrinciple = (principleId: string) => {
    const newCollapsed = new Set(collapsedPrinciples);
    if (newCollapsed.has(principleId)) {
      newCollapsed.delete(principleId);
    } else {
      newCollapsed.add(principleId);
    }
    setCollapsedPrinciples(newCollapsed);
  };

  const deleteCriterion = async (
    principleIndex: number,
    criterionIndex: number,
    criterionId: string,
  ) => {
    const selectedCriterionPidGraph = allCriteria?.find(
      (criterion) => criterion.cri === criterionId,
    )?.id;

    let response;
    try {
      if (
        assessment[principleIndex]?.id &&
        assessment[principleIndex].id !== "untagged"
      ) {
        const criImp = selectedCriteria?.map((item) => ({
          criterion_id: item.id,
          imperative_id: item.imperative.id,
        }));

        const filteredCriImp = criImp?.filter(
          (item) => item.criterion_id !== selectedCriterionPidGraph,
        );

        response =
          await assignCriteriaToActorMutation.mutateAsync(filteredCriImp);
      }

      if (
        response?.statusText === "OK" ||
        (!response && assessment[principleIndex]?.id === "untagged")
      ) {
        setAssessment((prevAssessment) => {
          const newAssessment = [...prevAssessment];
          const principle = newAssessment[principleIndex];
          if (principle && principle.criteria) {
            // Remove the criterion from the principle's criteria array
            principle.criteria.splice(criterionIndex, 1);

            // If this was the last criterion in the principle, remove the entire principle
            if (principle.criteria.length === 0) {
              newAssessment.splice(principleIndex, 1);
            }
          }

          if (selectedId === criterionId) {
            const nextPrinciple = newAssessment[principleIndex]?.criteria
              ?.length
              ? newAssessment[principleIndex]
              : newAssessment[0];
            const nextPrincipleIndex = newAssessment.findIndex(
              (p) => p.id === nextPrinciple.id,
            );
            const nextCriterion = nextPrinciple?.criteria?.[0];
            setBuilderState({
              entityMode: "criterion",
              formMode: "edit",
              selectedId: nextCriterion?.id || "",
              selectedPrincipleIndex:
                nextPrincipleIndex != null ? nextPrincipleIndex : -1,
              selectedCriterionIndex: nextCriterion != null ? 0 : -1,
            });
          }

          return newAssessment;
        });
        refetchCriteria();
      }
    } catch (error) {
      console.error("Remove criterion-principle failed:", error);
      throw error;
    }
  };

  const handleDeleteClick = (
    principleIndex: number,
    criterionIndex: number,
    criterionId: string,
    criterionName: string,
  ) => {
    setCriterionToDelete({
      principleIndex,
      criterionIndex,
      criterionId,
      criterionName,
    });
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (criterionToDelete) {
      deleteCriterion(
        criterionToDelete.principleIndex,
        criterionToDelete.criterionIndex,
        criterionToDelete.criterionId,
      );
    }

    setShowDeleteModal(false);
    setCriterionToDelete(null);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setCriterionToDelete(null);
  };

  const handleCriterionClick = (
    criterionId: string,
    principleIndex: number,
    criterionIndex: number,
  ) => {
    // Check if we're switching to a different criterion and have unsaved changes
    if (isEditing && hasUnsavedChanges && selectedId !== criterionId) {
      setPendingNavigation({
        entityMode: "criterion",
        formMode: "edit",
        selectedId: criterionId,
        selectedPrincipleIndex: principleIndex,
        selectedCriterionIndex: criterionIndex,
      });
      setShowUnsavedChangesModal(true);
      return;
    }

    setBuilderState({
      entityMode: "criterion",
      formMode: "edit",
      selectedId: criterionId,
      selectedPrincipleIndex: principleIndex,
      selectedCriterionIndex: criterionIndex,
    });
  };

  const confirmDiscardChanges = () => {
    if (pendingNavigation) {
      setBuilderState(pendingNavigation);
    }
    setShowUnsavedChangesModal(false);
    setPendingNavigation(null);
  };

  const cancelDiscardChanges = () => {
    setShowUnsavedChangesModal(false);
    setPendingNavigation(null);
  };

  return (
    <div className={styles["structure-tree"]}>
      {assessment?.map((principle: AssessmentPrinciple, principleIndex) => {
        if (!principle.id || principle.id === "untagged") return null;

        return (
          <div key={principleIndex} className={styles["principle-group"]}>
            <div
              className={`${styles["tree-item"]} ${styles["principle-item"]}`}
              onClick={() => togglePrinciple(principle.id)}
            >
              <span className={styles["tree-icon"]}>
                <FaFolder />
              </span>
              <span className={styles["principle-display"]}>
                {principle.id} - {principle.name}
              </span>
              <span style={{ marginLeft: "auto", marginRight: "8px" }}>
                {collapsedPrinciples.has(principle.id) ? (
                  <FaChevronUp />
                ) : (
                  <FaChevronDown />
                )}
              </span>
            </div>
            <div
              className={
                collapsedPrinciples.has(principle.id)
                  ? styles["no-display"]
                  : ""
              }
            >
              {principle?.criteria?.map((criterion, criterionIndex: number) => {
                return (
                  <div
                    key={criterionIndex}
                    className={`${styles["tree-item"]} ${styles["principle-item"]} ${styles["clickable"]} ${styles["nested"]}  ${
                      selectedId?.toLowerCase() === criterion.id?.toLowerCase()
                        ? styles["selected"]
                        : ""
                    }`}
                    onClick={() =>
                      handleCriterionClick(
                        criterion.id,
                        principleIndex,
                        criterionIndex,
                      )
                    }
                  >
                    <div className="d-flex align-items-center gap-1">
                      <span className={styles["tree-icon"]}>
                        <FaFileAlt />
                      </span>
                      <span>
                        <span className={styles["principle-display"]}>
                          {criterion.id} - {criterion.name}
                        </span>
                        {!isEditing && criterion.metric.result === 0 && (
                          <FaTimesCircle className="ms-2 text-danger" />
                        )}
                        {!isEditing && criterion.metric.result === 1 && (
                          <FaCheckCircle className="ms-2 text-success" />
                        )}
                        {isEditing &&
                          !isCriterionCompleted(
                            assessment[principleIndex || 0]?.criteria[
                              criterionIndex || 0
                            ]?.id || "",
                            assessment,
                          ) && (
                            <OverlayTrigger
                              placement="top"
                              overlay={
                                <Tooltip id="criterion-tooltip">
                                  This criterion has missing information. Please
                                  select and complete it.
                                </Tooltip>
                              }
                            >
                              <span
                                className={`${styles["config-btn-warning"]} ms-2`}
                              >
                                <FaExclamationCircle size="18px" />
                              </span>
                            </OverlayTrigger>
                          )}
                      </span>
                    </div>

                    {isEditing ? (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(
                            principleIndex,
                            criterionIndex,
                            criterion.id,
                            criterion.name,
                          );
                        }}
                        style={{
                          marginLeft: "auto",
                          marginRight: "8px",
                        }}
                      >
                        <FaTrash className={styles["delete-icon"]} />
                      </span>
                    ) : (
                      <>
                        {(criterion.imperative ===
                          AssessmentCriterionImperative.Must ||
                          criterion.imperative ===
                            AssessmentCriterionImperative.MUST) && (
                          <div
                            style={{
                              marginLeft: "auto",
                              marginRight: "16px",
                            }}
                          >
                            <small
                              style={{ fontSize: "0.7rem" }}
                              className="ms-2 badge rounded-pill text-bg-light text-secondary border align-middle"
                            >
                              {t("required")}
                            </small>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
            {principleIndex < assessment.length - 1 && (
              <div className={styles["principle-section-separator"]} />
            )}
          </div>
        );
      })}

      {/* Criteria with no Principles */}
      {(() => {
        const untaggedCriteria = assessment
          ?.filter((principle) => {
            if (principle.id === "untagged") {
              return principle;
            }
          })
          ?.flatMap((principle) => {
            return principle?.criteria?.filter((criterion) => {
              return !criterion.principle_id ? criterion : null;
            });
          });

        if (untaggedCriteria?.length > 0) {
          return (
            <div>
              <div
                className={`${styles["tree-item"]} ${styles["principle-item"]} ${styles["untagged"]}`}
                onClick={() => togglePrinciple("untagged")}
              >
                <span className={styles["tree-icon"]}>
                  <FaFolder />
                </span>
                <span className={styles["principle-display"]}>
                  Criteria without Principle
                </span>
                <span style={{ marginLeft: "auto", marginRight: "8px" }}>
                  {collapsedPrinciples.has("untagged") ? (
                    <FaChevronUp />
                  ) : (
                    <FaChevronDown />
                  )}
                </span>
              </div>

              <div
                className={
                  collapsedPrinciples.has("untagged")
                    ? styles["no-display"]
                    : ""
                }
              >
                {untaggedCriteria.map(
                  (criterion, untaggedCriteriaIndex: number) => {
                    const untaggedPrincipleIndex = assessment.findIndex(
                      (p) => p.id === "untagged",
                    );
                    return (
                      <div
                        key={untaggedCriteriaIndex}
                        className={`${styles["tree-item"]} ${styles["principle-item"]} ${styles["clickable"]} ${styles["nested"]}  ${
                          selectedId === criterion.id ? styles["selected"] : ""
                        }`}
                        onClick={() =>
                          handleCriterionClick(
                            criterion.id,
                            untaggedPrincipleIndex,
                            untaggedCriteriaIndex,
                          )
                        }
                      >
                        <span className={styles["tree-icon"]}>
                          <FaFileAlt />
                        </span>
                        <span className={styles["principle-display"]}>
                          {criterion.id} - {criterion.name}
                        </span>
                        <OverlayTrigger
                          placement="top"
                          overlay={
                            <Tooltip id="untagged-criterion-tooltip">
                              This criterion has missing information. Please
                              select and complete it.
                            </Tooltip>
                          }
                        >
                          <span className={`${styles["config-btn-warning"]}`}>
                            <FaExclamationCircle size="18px" />
                          </span>
                        </OverlayTrigger>
                        {isEditing && (
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(
                                untaggedPrincipleIndex,
                                untaggedCriteriaIndex,
                                criterion.id,
                                criterion.name,
                              );
                            }}
                            style={{
                              marginLeft: "auto",
                              marginRight: "8px",
                            }}
                          >
                            <FaTrash className={styles["delete-icon"]} />
                          </span>
                        )}
                      </div>
                    );
                  },
                )}
              </div>
            </div>
          );
        }
        return null;
      })()}
      <AssessmentBuilderDeleteModal
        isOpen={showDeleteModal}
        itemName={criterionToDelete?.criterionName || ""}
        itemType="criterion"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />

      {showUnsavedChangesModal && (
        <div
          className={styles["delete-modal-overlay"]}
          onClick={cancelDiscardChanges}
        >
          <div
            className={styles["delete-modal-content"]}
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className={styles["delete-modal-title"]}>Unsaved Changes</h4>
            <p className={styles["delete-modal-message"]}>
              You have unsaved changes. Are you sure you want to discard them
              and continue?
            </p>
            <div className={styles["delete-modal-actions"]}>
              <button
                className={styles["delete-modal-cancel-btn"]}
                onClick={cancelDiscardChanges}
              >
                Cancel
              </button>
              <button
                className={styles["delete-modal-remove-btn"]}
                onClick={confirmDiscardChanges}
              >
                Discard Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AssessmentBuilderStructure;
