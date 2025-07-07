import { useState } from "react";
import { AssessmentBuilderState, AssessmentPrinciple } from "@/types";
import {
  FaFileAlt,
  FaFolder,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";

function AssessmentBuilderStructure({
  setBuilderState,
  assessment,
  selectedId,
}: {
  setBuilderState: (state: AssessmentBuilderState) => void;
  assessment: AssessmentPrinciple[];
  selectedId?: string;
}) {
  const [collapsedPrinciples, setCollapsedPrinciples] = useState<Set<string>>(
    new Set(),
  );

  const togglePrinciple = (principleId: string) => {
    const newCollapsed = new Set(collapsedPrinciples);
    if (newCollapsed.has(principleId)) {
      newCollapsed.delete(principleId);
    } else {
      newCollapsed.add(principleId);
    }
    setCollapsedPrinciples(newCollapsed);
  };

  return (
    <div className="structure-tree ">
      {assessment?.map((principle: AssessmentPrinciple, principleIndex) => {
        if (!principle.id || principle.id === "untagged") return null;

        return (
          <div key={principleIndex} className="principle-group">
            <div
              className="tree-item principle-item cat-cursor-pointer"
              onClick={() => togglePrinciple(principle.id)}
            >
              <span className="tree-icon">
                <FaFolder />
              </span>
              <span className="principle-display">
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
                collapsedPrinciples.has(principle.id) ? "no-display" : ""
              }
            >
              {principle?.criteria?.map((criterion, criterionIndex: number) => {
                return (
                  <div
                    key={criterionIndex}
                    className={`tree-item principle-item clickable nested ${
                      selectedId === criterion.id ? "selected" : ""
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
                    <span className="tree-icon">
                      <FaFileAlt />
                    </span>
                    <span className="principle-display">
                      {criterion.id} - {criterion.name}
                    </span>
                  </div>
                );
              })}
            </div>
            {principleIndex < assessment.length - 1 && (
              <div className="principle-section-separator" />
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
            <div className="principle-group">
              <div
                className="tree-item principle-item untagged cat-cursor-pointer"
                onClick={() => togglePrinciple("untagged")}
              >
                <span className="tree-icon">
                  <FaFolder />
                </span>
                <span className="principle-display">Untagged Criteria</span>
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
                  collapsedPrinciples.has("untagged") ? "no-display" : ""
                }
              >
                {untaggedCriteria.map(
                  (criterion, untaggedCriteriaIndex: number) => {
                    return (
                      <div
                        key={untaggedCriteriaIndex}
                        className={`tree-item principle-item clickable nested ${
                          selectedId === criterion.id ? "selected" : ""
                        }`}
                        onClick={() =>
                          setBuilderState({
                            entityMode: "criterion",
                            formMode: "edit",
                            selectedId: criterion.id,
                            selectedPrincipleIndex: assessment.findIndex(
                              (p) => p.id === "untagged",
                            ),
                            selectedCriterionIndex: untaggedCriteriaIndex,
                          })
                        }
                      >
                        <span className="tree-icon">
                          <FaFileAlt />
                        </span>
                        <span className="principle-display">
                          {criterion.id} - {criterion.name}
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
    </div>
  );
}

export default AssessmentBuilderStructure;
