import { useContext, useEffect, useRef, useState } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import {
  AssessmentBuilderState,
  AssessmentPrinciple,
  AssessmentCriterionImperative,
  MetricFull,
  MetricTest,
  AlertInfo,
} from "@/types";
import { FaExclamationCircle, FaInfoCircle } from "react-icons/fa";
import TestPreviewModal from "../tests/components/TestPreviewModal";
import AssessmentBuilderMetric from "./AssessmentBuilderMetric";
import {
  useGetMotivationMetricTests,
  useUpdateMotivationMetricTests,
} from "@/api";
import { AuthContext } from "@/auth";
import { RegistryTest } from "@/types/tests";
import { relMtvMetricTest } from "@/config";
import toast from "react-hot-toast";
import styles from "./AssessmentBuilder.module.css";
import AssessmentBuilderDeleteModal from "./AssessmentBuilderDeleteModal";

interface AssessmentBuilderPreviewProps {
  assessment: AssessmentPrinciple[];
  builderState: AssessmentBuilderState;
  setBuilderState: React.Dispatch<React.SetStateAction<AssessmentBuilderState>>;
  setAssessment: React.Dispatch<React.SetStateAction<AssessmentPrinciple[]>>;
  mtvId?: string;
  mtrId?: string;
  criterionPidGraph?: string;
  motivationMetrics?: MetricFull[];
  refetchAssessmentData: () => void;
  isPrincipleSelected: boolean;
  setIsPrincipleSelected: React.Dispatch<React.SetStateAction<boolean>>;
  isTestSelected: boolean;
  setIsTestSelected: React.Dispatch<React.SetStateAction<boolean>>;
}

function AssessmentBuilderPreview({
  mtvId,
  mtrId,
  criterionPidGraph,
  assessment,
  builderState,
  setBuilderState,
  setAssessment,
  motivationMetrics,
  refetchAssessmentData,
  isPrincipleSelected,
  setIsPrincipleSelected,
  isTestSelected,
  setIsTestSelected,
}: AssessmentBuilderPreviewProps) {
  const { keycloak, registered } = useContext(AuthContext)!;
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [isAlgorithmConfigured, setIsAlgorithmConfigured] = useState(false);
  const [selectedTests, setSelectedTests] = useState<RegistryTest[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState({
    testId: "",
    testLabel: "",
  });
  const { t } = useTranslation();

  const alert = useRef<AlertInfo>({
    message: "",
  });

  useEffect(() => {
    if (builderState.selectedId) {
      setIsPrincipleSelected(false);
      setIsTestSelected(false);
      setIsConfiguring(false);
    }
  }, [
    builderState.selectedId,
    setIsPrincipleSelected,
    setIsTestSelected,
    setIsConfiguring,
  ]);

  const mutationUpdateMetricTests = useUpdateMotivationMetricTests(
    keycloak?.token || "",
    mtvId || "",
    mtrId || "",
  );

  const {
    data: selTestData,
    fetchNextPage: selTestFetchNextPage,
    hasNextPage: selTestHasNextPage,
  } = useGetMotivationMetricTests(mtvId || "", mtrId || "", {
    size: 5,
    token: keycloak?.token || "",
    isRegistered: registered,
  });

  useEffect(() => {
    let tmpSelTests: MetricTest[] = [];

    if (selTestData?.pages) {
      selTestData.pages.map((page) => {
        if (page.metric) tmpSelTests = [...tmpSelTests, ...page.metric.tests];
      });
      if (selTestHasNextPage) {
        selTestFetchNextPage();
      }
    }
    setSelectedTests(
      tmpSelTests.map((item) => {
        return {
          id: item.db_id,
          tes: item.id,
          label: item.name,
          description: item.description,
        };
      }),
    );
  }, [selTestData, selTestHasNextPage, selTestFetchNextPage]);

  const handleTestDelete = (testId: string) => {
    if (selectedTests.length === 0) return;

    const filteredTests = selectedTests.filter(
      (test) => test.tes?.toLowerCase() !== testId?.toLowerCase(),
    );

    const metricAssignment =
      filteredTests?.map((test) => ({
        test_id: test.id,
        relation: relMtvMetricTest,
      })) || [];

    setSelectedTests(filteredTests);

    const assignTestsToMetricPromise = mutationUpdateMetricTests
      .mutateAsync(metricAssignment)
      .catch((err) => {
        alert.current = {
          message: t("page_motivations.toast_assign_metric_fail"),
        };
        throw err;
      })
      .then(() => {
        refetchAssessmentData();
        alert.current = {
          message: t("page_motivations.toast_assign_metric_success"),
        };
      });

    toast.promise(assignTestsToMetricPromise, {
      loading: t("toast_assign_metric_progress"),
      success: () => alert.current.message,
      error: () => alert.current.message,
    });
  };

  const confirmDeleteTest = () => {
    if (showDeleteModal.testId) {
      handleTestDelete(showDeleteModal.testId);
    }
    setShowDeleteModal({ testId: "", testLabel: "" });
  };

  const cancelDeleteTest = () => {
    setShowDeleteModal({ testId: "", testLabel: "" });
  };

  return (
    <div className={styles["column-content"]}>
      {assessment?.length > 0 ? (
        <div className={styles["builder-preview"]}>
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

              <div
                className={`${styles["config-header"]} my-3 ${
                  isPrincipleSelected ? styles["selected"] : ""
                }`}
                onClick={() => {
                  setIsPrincipleSelected((prev) => {
                    if (!prev) {
                      setIsTestSelected(false);
                      setIsConfiguring(false);
                      return true;
                    }
                    return false;
                  });
                  if (isPrincipleSelected) {
                    setBuilderState((prevState) => ({
                      ...prevState,
                      entityMode: "criterion",
                      formMode: "edit",
                    }));
                  } else {
                    setBuilderState((prevState) => ({
                      ...prevState,
                      entityMode: "principle",
                      formMode: "new",
                    }));
                  }
                }}
              >
                {assessment[builderState.selectedPrincipleIndex || 0]?.name ? (
                  <>
                    <div className={styles["config-header-title"]}>
                      Part of Principle{" "}
                      {assessment[builderState.selectedPrincipleIndex || 0]?.id}
                      :{" "}
                      {
                        assessment[builderState.selectedPrincipleIndex || 0]
                          ?.name
                      }
                      <OverlayTrigger
                        placement="top"
                        overlay={
                          <Tooltip
                            id={`tip-pri-${
                              builderState.selectedPrincipleIndex &&
                              builderState.selectedPrincipleIndex > -1 &&
                              assessment[builderState.selectedPrincipleIndex]
                                ?.id
                            }`}
                          >
                            {
                              assessment[
                                builderState.selectedPrincipleIndex || 0
                              ]?.description
                            }
                          </Tooltip>
                        }
                      >
                        <span className="ms-2 mb-2">
                          <FaInfoCircle
                            size="18px"
                            className="text-secondary opacity-50 align-middle"
                          />
                        </span>
                      </OverlayTrigger>
                    </div>
                    <div className={styles["config-header-right"]}>
                      <button
                        className={`${styles["config-edit-btn"]} ${isPrincipleSelected ? styles["selected"] : ""}`}
                      >
                        {isPrincipleSelected ? "Editing" : "Edit"}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className={styles["config-header-left"]}>
                      <span
                        className={styles["config-header-title"]}
                        style={{ color: "grey" }}
                      >
                        (+) Add a Principle
                      </span>
                      <OverlayTrigger
                        placement="top"
                        overlay={
                          <Tooltip id="algorithm-config-tooltip">
                            Principle is required. Please select a principle for
                            the criterion.
                          </Tooltip>
                        }
                      >
                        <span className={styles["config-btn-warning"]}>
                          <FaExclamationCircle size="18px" />
                        </span>
                      </OverlayTrigger>
                    </div>
                    <div className={styles["config-header-right"]}>
                      <button
                        className={`${styles["config-edit-btn"]} ${isPrincipleSelected ? styles["selected"] : ""}`}
                      >
                        {isPrincipleSelected ? "Editing" : "Edit"}
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Algorithm Configuration Section */}
              <AssessmentBuilderMetric
                assessment={assessment}
                builderState={builderState}
                setBuilderState={setBuilderState}
                setAssessment={setAssessment}
                mtvId={mtvId}
                criterionPidGraph={criterionPidGraph}
                motivationMetrics={motivationMetrics}
                refetchAssessmentData={refetchAssessmentData}
                isConfiguring={isConfiguring}
                setIsConfiguring={setIsConfiguring}
                setIsPrincipleSelected={setIsPrincipleSelected}
                setIsTestSelected={setIsTestSelected}
                setIsAlgorithmConfigured={setIsAlgorithmConfigured}
              />

              {/* Tests Configuration Section */}
              <div>
                <OverlayTrigger
                  placement="top"
                  overlay={
                    <Tooltip id="test-section-disabled-tooltip">
                      {!isAlgorithmConfigured
                        ? "You must configure the algorithm first in order to add tests to this criterion"
                        : "Click to add a test to this criterion"}
                    </Tooltip>
                  }
                >
                  <div
                    className={`${styles["config-header"]} my-3 
                    ${!isAlgorithmConfigured && styles["disabled"]}
                    ${isTestSelected && styles["selected"]}`}
                    onClick={() => {
                      if (!isAlgorithmConfigured) return;

                      setIsTestSelected((prev) => {
                        if (!prev) {
                          setIsPrincipleSelected(false);
                          setIsConfiguring(false);
                          return true;
                        }
                        return false;
                      });
                      if (isTestSelected) {
                        setBuilderState((prevState) => ({
                          ...prevState,
                          entityMode: "criterion",
                          formMode: "edit",
                        }));
                      } else {
                        setBuilderState((prevState) => ({
                          ...prevState,
                          entityMode: "tests",
                          formMode: "new",
                        }));
                      }
                    }}
                  >
                    <div className={styles["config-header-left"]}>
                      <span
                        className={styles["config-header-title"]}
                        style={{ color: "grey" }}
                      >
                        (+) Add a Test
                      </span>
                      {(!isAlgorithmConfigured ||
                        !assessment[builderState.selectedPrincipleIndex || 0]
                          ?.criteria[builderState.selectedCriterionIndex]
                          ?.metric?.tests?.length) && (
                        <OverlayTrigger
                          placement="top"
                          overlay={
                            <Tooltip id="tests-config-tooltip">
                              {!isAlgorithmConfigured
                                ? "You must configure the algorithm first in order to add tests to this criterion"
                                : "Tests assignment is required. Please add at least a test to complete your criterion setup."}
                            </Tooltip>
                          }
                        >
                          <span className={styles["config-btn-warning"]}>
                            <FaExclamationCircle size="18px" />
                          </span>
                        </OverlayTrigger>
                      )}
                    </div>
                    <div className={styles["config-header-right"]}>
                      <button
                        className={`${styles["config-edit-btn"]} ${isTestSelected ? styles["selected"] : ""}`}
                        disabled={!isAlgorithmConfigured}
                      >
                        {isTestSelected ? "Editing" : "Edit"}
                      </button>
                    </div>
                  </div>
                </OverlayTrigger>
              </div>
              {(() => {
                const tests =
                  assessment[builderState.selectedPrincipleIndex || 0]
                    ?.criteria[builderState.selectedCriterionIndex]?.metric
                    ?.tests;

                return (
                  <div>
                    {tests &&
                      tests.length > 0 &&
                      tests.map((test) => (
                        <div
                          key={test.id}
                          className={`${styles["test-item"]} my-3`}
                        >
                          <TestPreviewModal
                            test={{
                              tes: test.id || "",
                              label: test.name || "",
                              description: test.description || "",
                            }}
                            params={(() => {
                              // Handle single values vs pipe-separated values
                              const names =
                                "params" in test && test.params
                                  ? typeof test.params === "string" &&
                                    test.params.includes("|")
                                    ? test.params.split("|")
                                    : [test.params]
                                  : [];
                              const texts =
                                "text" in test && test.text
                                  ? typeof test.text === "string" &&
                                    test.text.includes("|")
                                    ? test.text.split("|")
                                    : [test.text]
                                  : [];
                              const tooltips =
                                "tool_tip" in test && test.tool_tip
                                  ? typeof test.tool_tip === "string" &&
                                    test.tool_tip.includes("|")
                                    ? test.tool_tip.split("|")
                                    : [test.tool_tip]
                                  : [];

                              const maxLength = Math.max(
                                names.length,
                                texts.length,
                                tooltips.length,
                              );

                              return Array.from(
                                { length: maxLength },
                                (_, index) => ({
                                  id: index,
                                  name: names[index] || "",
                                  text: texts[index] || "",
                                  tooltip: tooltips[index] || "",
                                }),
                              );
                            })()}
                            testMethodName={test.type}
                            onTestDelete={() =>
                              setShowDeleteModal({
                                testId: test.id,
                                testLabel: test.name,
                              })
                            }
                          />
                        </div>
                      ))}
                  </div>
                );
              })()}
            </div>
          ) : (
            builderState.selectedCriterionIndex == null ||
            (builderState.selectedCriterionIndex < 0 && (
              <div className="mt-2">
                <p className="text-muted text-center">
                  Please select a criterion from the structure list or add a new
                  criterion to see its details here
                </p>
              </div>
            ))
          )}
        </div>
      ) : null}
      <AssessmentBuilderDeleteModal
        isOpen={Boolean(showDeleteModal?.testId)}
        itemName={showDeleteModal?.testLabel || ""}
        itemType="test"
        onConfirm={confirmDeleteTest}
        onCancel={cancelDeleteTest}
      />
    </div>
  );
}

export default AssessmentBuilderPreview;
