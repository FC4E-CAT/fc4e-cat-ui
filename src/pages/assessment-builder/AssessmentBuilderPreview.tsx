import { useContext, useEffect, useRef, useState } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import {
  AssessmentBuilderState,
  AssessmentPrinciple,
  AssessmentCriterionImperative,
  MetricFull,
  AlertInfo,
  AssessmentTest,
  RegistryResource,
} from "@/types";
import { FaExclamationCircle, FaInfoCircle, FaSlidersH } from "react-icons/fa";
import TestPreviewModal from "../tests/components/TestPreviewModal";
import AssessmentBuilderMetric from "./AssessmentBuilderMetric";
import {
  useGetMotivationMetricTests,
  useUpdateMotivationMetricTests,
} from "@/api";
import { AuthContext } from "@/auth";
import { RegistryTest, TestInput, TestParam } from "@/types/tests";
import { relMtvMetricTest } from "@/config";
import toast from "react-hot-toast";
import styles from "./AssessmentBuilder.module.css";
import AssessmentBuilderDeleteModal from "./AssessmentBuilderDeleteModal";
import { removeTestFromUntaggedCriterion } from "./utils/assessmentBuilderUtils";
import { useGetAllTestMethods } from "@/api/services/registry";
import {
  CancelFormMotivationTest,
  CreateFormMotivationTest,
} from "@/custom-hooks/usePubSub/events/assessmentBuilder";
import usePublish from "@/custom-hooks/usePubSub/usePublish";

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
  test: TestInput;
  params: TestParam[];
  hasEvidence: boolean;
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
  test,
  params,
  hasEvidence,
}: AssessmentBuilderPreviewProps) {
  const { keycloak, registered } = useContext(AuthContext)!;
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [isPrincipleAssigned, setIsPrincipleAssigned] = useState(false);
  const [selectedTests, setSelectedTests] = useState<RegistryTest[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState({
    testId: "",
    testLabel: "",
  });
  const { t } = useTranslation();
  const alert = useRef<AlertInfo>({
    message: "",
  });

  const { publish: saveTestCreation } = usePublish<void>(
    CreateFormMotivationTest.type,
  );
  const { publish: cancelTestCreation } = usePublish<void>(
    CancelFormMotivationTest.type,
  );

  useEffect(() => {
    if (
      assessment.length > 0 &&
      builderState.selectedPrincipleIndex !== null &&
      builderState.selectedCriterionIndex !== null
    ) {
      const selectedPrinciple =
        assessment[builderState.selectedPrincipleIndex || 0];

      // Check if the principle exists and is not the "untagged" principle
      setIsPrincipleAssigned(
        Boolean(
          selectedPrinciple &&
            selectedPrinciple.id &&
            selectedPrinciple.id !== "untagged" &&
            selectedPrinciple.name &&
            selectedPrinciple.name.trim() !== "",
        ),
      );
    } else {
      setIsPrincipleAssigned(false);
    }
  }, [
    assessment,
    builderState.selectedPrincipleIndex,
    builderState.selectedCriterionIndex,
  ]);

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

  const { data: metricTestsData } = useGetMotivationMetricTests(
    mtvId || "",
    mtrId || "",
    {
      token: keycloak?.token || "",
      isRegistered: showDeleteModal?.testId && registered ? registered : false,
    },
  );

  const { data: testMethodsData } = useGetAllTestMethods({
    size: 100,
    token: keycloak?.token || "",
    isRegistered: registered,
    search: "",
    enabled: true,
  });

  // Extract test methods from the paginated data structure
  const testMethods: RegistryResource[] =
    testMethodsData?.pages?.flatMap((page) => page.content) || [];

  useEffect(() => {
    setSelectedTests(
      metricTestsData?.pages
        .flatMap((page) => page?.metric.tests || [])
        .map((item) => ({
          id: item.db_id,
          tes: item.id,
          label: item.name,
          description: item.description,
        })) || [],
    );
  }, [metricTestsData]);

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

        removeTestFromUntaggedCriterion({
          testId,
          selectedCriterionId: builderState.selectedId || "",
          assessment,
          setAssessment,
        });

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

  const getTestParams = (test: AssessmentTest) => {
    // Handle single values vs pipe-separated values
    const names =
      "params" in test && test.params
        ? typeof test.params === "string" && test.params.includes("|")
          ? test.params.split("|")
          : [test.params]
        : [];

    const texts =
      "text" in test && test.text
        ? typeof test.text === "string" && test.text.includes("|")
          ? test.text.split("|")
          : [test.text]
        : [];

    const tooltips =
      "tool_tip" in test && test.tool_tip
        ? typeof test.tool_tip === "string" && test.tool_tip.includes("|")
          ? test.tool_tip.split("|")
          : [test.tool_tip]
        : [];

    const maxLength = Math.max(names.length, texts.length, tooltips.length);

    return Array.from({ length: maxLength }, (_, index) => ({
      id: index,
      name: names[index] || "",
      text: texts[index] || "",
      tooltip: tooltips[index] || "",
    }));
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
              {/* Criterion Title with Advanced Settings Button */}
              <div className={styles["criterion-header"]}>
                <div className={styles["criterion-title-section"]}>
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
                  {assessment[builderState.selectedPrincipleIndex || 0]
                    ?.criteria[builderState.selectedCriterionIndex]
                    ?.imperative === AssessmentCriterionImperative.MUST ? (
                    <span className="badge bg-success bg-small ms-2 align-middle">
                      {t("required")}
                    </span>
                  ) : (
                    <span className="badge bg-warning bg-small ms-2 align-middle">
                      {t("optional")}
                    </span>
                  )}
                </div>
                <div className={styles["advanced-settings-container"]}>
                  {isConfiguring || !isPrincipleAssigned ? (
                    <OverlayTrigger
                      placement="top"
                      overlay={
                        <Tooltip id="test-section-disabled-tooltip">
                          You must add a principle first in order to can change
                          the advanced settings
                        </Tooltip>
                      }
                    >
                      <button
                        className={styles["advanced-settings-btn"]}
                        onClick={() => setIsConfiguring((prev) => !prev)}
                        disabled={isConfiguring || !isPrincipleAssigned}
                      >
                        <FaSlidersH /> Advanced Settings
                      </button>
                    </OverlayTrigger>
                  ) : (
                    <button
                      className={styles["advanced-settings-btn"]}
                      onClick={() => setIsConfiguring((prev) => !prev)}
                    >
                      <FaSlidersH /> Advanced Settings
                    </button>
                  )}

                  {/* Advanced Settings Modal positioned relative to button */}
                  {isConfiguring && (
                    <div className={styles["advanced-settings-modal"]}>
                      <div
                        className={styles["modal-backdrop"]}
                        onClick={() => setIsConfiguring(false)}
                      />
                      <div className={styles["modal-content"]}>
                        <AssessmentBuilderMetric
                          assessment={assessment}
                          builderState={builderState}
                          mtvId={mtvId}
                          mtrId={mtrId}
                          criterionPidGraph={criterionPidGraph}
                          motivationMetrics={motivationMetrics}
                          refetchAssessmentData={refetchAssessmentData}
                          setIsConfiguring={setIsConfiguring}
                          onClose={() => setIsConfiguring(false)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

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

              {/* Tests Configuration Section */}
              <div>
                <OverlayTrigger
                  placement="bottom"
                  overlay={
                    <Tooltip id="test-section-disabled-tooltip">
                      {!isPrincipleAssigned
                        ? "You must add a principle first in order to add tests to this criterion"
                        : "Click to add a test to this criterion"}
                    </Tooltip>
                  }
                >
                  <div
                    className={`${styles["config-header"]} my-3 
                    ${!isPrincipleAssigned && styles["disabled"]}
                    ${isTestSelected && styles["selected"]}`}
                    onClick={() => {
                      if (!isPrincipleAssigned) return;

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
                          entityMode: "test",
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
                      {(!isPrincipleAssigned ||
                        !assessment[builderState.selectedPrincipleIndex || 0]
                          ?.criteria[builderState.selectedCriterionIndex]
                          ?.metric?.tests?.length) && (
                        <OverlayTrigger
                          placement="top"
                          overlay={
                            <Tooltip id="tests-config-tooltip">
                              {!isPrincipleAssigned
                                ? "You must add a principle first in order to add tests to this criterion"
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
                        disabled={!isPrincipleAssigned}
                      >
                        {isTestSelected ? "Editing" : "Edit"}
                      </button>
                    </div>
                  </div>
                </OverlayTrigger>
              </div>
              {isTestSelected && builderState.formMode === "new" && (
                <TestPreviewModal
                  test={{
                    tes: test.tes || "",
                    label: test.label || "",
                    description: test.description || "",
                  }}
                  params={params}
                  testMethodName={
                    testMethods?.find(
                      (testMethod) => testMethod?.id === test?.test_method_id,
                    )?.label || ""
                  }
                  hasEvidenceParam={hasEvidence}
                  onTestCancel={() =>
                    cancelTestCreation(CancelFormMotivationTest.type, undefined)
                  }
                  onTestSave={() =>
                    saveTestCreation(CreateFormMotivationTest.type, undefined)
                  }
                />
              )}

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
                            params={getTestParams(test)}
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
      ) : (
        <div className="mt-2">
          <p className="text-muted text-center">
            Please select a criterion from the structure list or add a new
            criterion to see its details here
          </p>
        </div>
      )}
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
