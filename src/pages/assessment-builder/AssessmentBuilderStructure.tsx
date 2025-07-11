import { useContext, useEffect, useState } from "react";
import {
  AssessmentBuilderState,
  AssessmentPrinciple,
  Criterion,
} from "@/types";
import {
  FaFileAlt,
  FaFolder,
  FaChevronDown,
  FaChevronUp,
  FaTrash,
} from "react-icons/fa";
import AssessmentBuilderDeleteModal from "./AssessmentBuilderDeleteModal";
import { formatDataToAssignPrincipleToCriterion } from "./utils";
import { useUpdateMotivationPrinciplesCriteria } from "@/api";
import { AuthContext } from "@/auth";
import styles from "./AssessmentBuilder.module.css";

function AssessmentBuilderStructure({
  mtvId,
  setBuilderState,
  assessment,
  setAssessment,
  selectedId,
  motivationCriteriaMutation,
  allCriteria,
}: {
  mtvId?: string;
  setBuilderState: (state: AssessmentBuilderState) => void;
  assessment: AssessmentPrinciple[];
  setAssessment: React.Dispatch<React.SetStateAction<AssessmentPrinciple[]>>;
  selectedId?: string;
  motivationCriteriaMutation: {
    mutateAsync: (data: { mtvId: string }) => Promise<{ content: Criterion[] }>;
  };
  allCriteria: Criterion[];
}) {
  const { keycloak } = useContext(AuthContext)!;
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

  const assignPrincipleToCriterion = useUpdateMotivationPrinciplesCriteria(
    keycloak?.token || "",
    mtvId || "",
  );

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
        setAssessment(reorderedAssessment);
      }
    }
  }, [assessment, setAssessment]);

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
          if (criterion.id === selectedId) {
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
    // If selectedId is not found, reset indices
    setBuilderState({
      entityMode: "none",
      formMode: "none",
      selectedId: "",
      selectedPrincipleIndex: -1,
      selectedCriterionIndex: -1,
    });
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
    const allMotivationCriteriaData =
      await motivationCriteriaMutation.mutateAsync({
        mtvId: mtvId || "",
      });

    const allMotivationCriteria = allMotivationCriteriaData?.content || [];

    let formattedPriCri = formatDataToAssignPrincipleToCriterion({
      allMotivationCriteria: allMotivationCriteria,
      principleId: "",
      criterionId: "",
    });

    const selectedCriterionPidGraph = allCriteria?.find(
      (criterion) => criterion.cri === criterionId,
    )?.id;

    formattedPriCri = formattedPriCri.filter(
      (item) => item.criterion_id !== selectedCriterionPidGraph,
    );

    let response;
    try {
      if (
        assessment[principleIndex]?.id &&
        assessment[principleIndex].id !== "untagged"
      ) {
        response =
          await assignPrincipleToCriterion.mutateAsync(formattedPriCri);
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

  return (
    <div className={styles.structureTree}>
      {assessment?.map((principle: AssessmentPrinciple, principleIndex) => {
        if (!principle.id || principle.id === "untagged") return null;

        return (
          <div key={principleIndex} className={styles.principleGroup}>
            <div
              className={`${styles.treeItem} ${styles.principleItem}`}
              onClick={() => togglePrinciple(principle.id)}
            >
              <span className={styles.treeIcon}>
                <FaFolder />
              </span>
              <span className={styles.principleDisplay}>
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
                collapsedPrinciples.has(principle.id) ? styles.noDisplay : ""
              }
            >
              {principle?.criteria?.map((criterion, criterionIndex: number) => {
                return (
                  <div
                    key={criterionIndex}
                    className={`${styles.treeItem} ${styles.principleItem} ${styles.clickable} ${styles.nested}  ${
                      selectedId === criterion.id ? styles.selected : ""
                    }`}
                    onClick={() =>
                      setBuilderState({
                        entityMode: "criterion",
                        formMode: "edit",
                        selectedId: criterion.id,
                        selectedPrincipleIndex: principleIndex,
                        selectedCriterionIndex: criterionIndex,
                      })
                    }
                  >
                    <span className={styles.treeIcon}>
                      <FaFileAlt />
                    </span>
                    <span className={styles.principleDisplay}>
                      {criterion.id} - {criterion.name}
                    </span>
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
                        cursor: "pointer",
                        color: "#6c757d",
                        fontSize: "0.8rem",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = "#dc3545";
                        e.currentTarget.style.transform = "scale(1.1)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = "#6c757d";
                        e.currentTarget.style.transform = "scale(1)";
                      }}
                    >
                      <FaTrash />
                    </span>
                  </div>
                );
              })}
            </div>
            {principleIndex < assessment.length - 1 && (
              <div className={styles.principleSectionSeparator} />
            )}
          </div>
        );
      })}

      {/* Untagged Criteria */}
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
                className={`${styles.treeItem} ${styles.principleItem} ${styles.untagged}`}
                onClick={() => togglePrinciple("untagged")}
              >
                <span className={styles.treeIcon}>
                  <FaFolder />
                </span>
                <span className={styles.principleDisplay}>
                  Untagged Criteria
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
                  collapsedPrinciples.has("untagged") ? styles.noDisplay : ""
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
                        className={`${styles.treeItem} ${styles.principleItem} ${styles.clickable} ${styles.nested} ${
                          selectedId === criterion.id ? styles.selected : ""
                        }`}
                        onClick={() =>
                          setBuilderState({
                            entityMode: "criterion",
                            formMode: "edit",
                            selectedId: criterion.id,
                            selectedPrincipleIndex: untaggedPrincipleIndex,
                            selectedCriterionIndex: untaggedCriteriaIndex,
                          })
                        }
                      >
                        <span className={styles.treeIcon}>
                          <FaFileAlt />
                        </span>
                        <span className={styles.principleDisplay}>
                          {criterion.id} - {criterion.name}
                        </span>
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
                            cursor: "pointer",
                            color: "#6c757d",
                            fontSize: "0.8rem",
                            transition: "all 0.2s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = "#dc3545";
                            e.currentTarget.style.transform = "scale(1.1)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = "#6c757d";
                            e.currentTarget.style.transform = "scale(1)";
                          }}
                        >
                          <FaTrash />
                        </span>
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
    </div>
  );
}

export default AssessmentBuilderStructure;
