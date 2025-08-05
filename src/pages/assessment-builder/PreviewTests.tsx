import { AuthContext } from "@/auth";
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { FaInfoCircle } from "react-icons/fa";
import { Form, Tooltip, OverlayTrigger } from "react-bootstrap";
import styles from "./AssessmentBuilder.module.css";
import { useTranslation } from "react-i18next";
import { RegistryTest, TestFull, TestInput, TestParam } from "@/types/tests";
import toast from "react-hot-toast";
import { relMtvMetricTest } from "@/config";
import TestPreviewModal from "../tests/components/TestPreviewModal";
import {
  AlertInfo,
  AssessmentBuilderState,
  AssessmentPrinciple,
  FormMode,
  RegistryResource,
} from "@/types";
import {
  useCreateTest,
  useGetAllTestMethods,
  useUpdateTest,
} from "@/api/services/registry";
import { useUpdateMotivationMetricTests } from "@/api";
import { TestMethodId } from "@/custom-hooks/usePubSub/events/assessmentBuilder";
import useSubscribe from "@/custom-hooks/usePubSub/useSubscribe";

interface AssessmentBuilderTestsProps {
  mtvId: string;
  mtrId: string;
  selectedCriterionId?: string;
  assessment: AssessmentPrinciple[];
  setBuilderState: React.Dispatch<React.SetStateAction<AssessmentBuilderState>>;
  refetchAssessmentData: () => void;
  setIsTestSelected: React.Dispatch<React.SetStateAction<boolean>>;
  allTests: RegistryTest[];
  testToEdit?: TestFull | null;
  setTestToEdit?: React.Dispatch<React.SetStateAction<TestFull | null>>;
  formMode: FormMode;
}

function PreviewTests({
  assessment,
  mtvId,
  mtrId,
  selectedCriterionId,
  setBuilderState,
  setIsTestSelected,
  refetchAssessmentData,
  allTests,
  testToEdit,
  setTestToEdit,
  formMode,
}: AssessmentBuilderTestsProps) {
  const alert = useRef<AlertInfo>({
    message: "",
  });

  const { keycloak, registered } = useContext(AuthContext)!;
  const { t } = useTranslation();
  const [test, setTest] = useState<TestInput>({
    tes: testToEdit?.id || "",
    label: testToEdit?.name || "",
    description: testToEdit?.description || "",
    test_method_id: testToEdit?.type_db_id || "pid_graph:8D79984F",
    db_id: testToEdit?.db_id || "",
    label_test_definition: "",
    param_type: "onscreen",
  });

  const [params, setParams] = useState<TestParam[]>(
    testToEdit
      ? [
          {
            id: 1,
            name: testToEdit.params || "",
            text: testToEdit.text || "",
            tooltip: testToEdit.tool_tip || "",
          },
        ]
      : [],
  );

  const [hasEvidence, setHasEvidence] = useState(
    testToEdit?.params?.includes("evidence") || false,
  );

  const [showErrors, setShowErrors] = useState(false);

  const mutateCreateTest = useCreateTest(keycloak?.token || "", test);
  const mutateUpdateTest = useUpdateTest(
    keycloak?.token || "",
    test?.db_id || "",
    { ...test, tooltip: test.tool_tip },
  );

  const mutationUpdateMetricTests = useUpdateMotivationMetricTests(
    keycloak?.token || "",
    mtvId || "",
    mtrId || "",
  );

  const { data: testMethodsData } = useGetAllTestMethods({
    size: 100,
    token: keycloak?.token || "",
    isRegistered: registered,
    search: "",
    enabled: true,
  });

  // Extract test methods from the paginated data structure
  const testMethods: RegistryResource[] = useMemo(
    () => testMethodsData?.pages?.flatMap((page) => page.content) || [],
    [testMethodsData],
  );

  const selectedCriterion = assessment
    ?.flatMap((principle) => principle.criteria || [])
    ?.find((criterion) => criterion.id === selectedCriterionId);

  const testIdsInCriterion =
    selectedCriterion?.metric?.tests
      ?.map((test) => test?.id?.toLowerCase())
      ?.filter(Boolean) || [];

  const testMethodName = useMemo(() => {
    const testMethod = testMethods?.find(
      (testMethod) => testMethod?.id === test?.test_method_id,
    );
    if (testMethod) {
      return testMethod?.friendly_label || testMethod?.label || "";
    }
  }, [testMethods, test.test_method_id]);

  const updateParamTestDef = useCallback(() => {
    let names = "";
    let text = "";
    let tips = "";
    const subParams = params.filter((item) => item.name !== "evidence");

    // iterate over params (minus evidence) and update test def
    subParams.forEach((item) => {
      names === ""
        ? (names = item.name)
        : item?.name && (names = names + "|" + item.name);
      text === ""
        ? (text = item.text)
        : item?.text && (text = text + "|" + item.text);
      tips === ""
        ? (tips = item.tooltip)
        : item?.tooltip && (tips = tips + "|" + item.tooltip);
    });

    // Add evidence parameter if toggle is on
    if (hasEvidence) {
      names = names === "" ? "evidence" : names + "|evidence";
    }

    setTest((test) => ({
      ...test,
      test_question: text,
      test_params: names,
      tool_tip: tips,
    }));
  }, [params, hasEvidence, setTest]);

  const addNewParams = useCallback(
    (numberOfParams = 1, testToEdit: TestFull | undefined) => {
      const tmpParams = Array.from(
        { length: numberOfParams },
        (_, i) => i + 1,
      )?.map((index) => {
        if (testToEdit && testToEdit?.params) {
          // Split the string fields by "|" to get individual parameters
          const paramNames = testToEdit.params.split("|");
          const paramTexts = testToEdit.text ? testToEdit.text.split("|") : [];
          const paramTooltips = testToEdit.tool_tip
            ? testToEdit.tool_tip.split("|")
            : [];

          return {
            id: index,
            name: paramNames[index - 1] || "",
            text: paramTexts[index - 1] || "",
            tooltip: paramTooltips[index - 1] || "",
          };
        }

        return {
          id: index,
          name: "",
          text: "",
          tooltip: "",
        };
      });
      setParams(tmpParams);
    },
    [setParams],
  );

  // Watch for changes in test_method_id to update the selected method parameters
  useEffect(() => {
    if (testMethods?.length > 0 && test.test_method_id) {
      const method = testMethods.find((m) => m.id === test.test_method_id);
      if (method) {
        addNewParams(method?.num_params, testToEdit ? testToEdit : undefined);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [test.test_method_id, JSON.stringify(testMethods)]);

  const resetTestStates = useCallback(() => {
    setTest({
      tes: "",
      label: "",
      description: "",
      test_method_id: "pid_graph:8D79984F",
      test_question: "",
      test_params: "",
      tool_tip: "",
      param_type: "onscreen",
    });
    setParams([]);
    setHasEvidence(false);
    setShowErrors(false);
    setIsTestSelected(false);
    setTestToEdit?.(null);
  }, [setTest, setParams, setHasEvidence, setIsTestSelected, setTestToEdit]);

  useSubscribe<string>(
    TestMethodId.type,
    (testMethodId) =>
      setTest((prevTest) => ({
        ...prevTest,
        test_method_id: testMethodId || "pid_graph:8D79984F",
      })),
    [setTest],
  );

  const handleValidate = useCallback((): boolean => {
    const isValid =
      test.tes.trim() !== "" &&
      test.label.trim() !== "" &&
      test.description.trim() !== "" &&
      test.test_method_id !== "" &&
      params.every(
        (param) =>
          param.name.trim() !== "" &&
          param.text.trim() !== "" &&
          param.tooltip.trim() !== "",
      );

    setShowErrors(!isValid);
    return isValid;
  }, [test, params]);

  const updateParam = (id: number, field: keyof TestParam, value: string) => {
    setParams((prev) =>
      prev.map((param) =>
        param.id === id ? { ...param, [field]: value } : param,
      ),
    );
  };

  const handleCancel = useCallback(() => {
    resetTestStates();
    setBuilderState((prevState) => ({
      ...prevState,
      entityMode: "criterion",
      formMode: "edit",
    }));
    setTestToEdit?.(null);
  }, [resetTestStates, setBuilderState, setTestToEdit]);

  const handleSubmit = () => {
    if (!handleValidate()) {
      return;
    }

    updateParamTestDef();

    if (formMode === "new") {
      const metricAssignment = testIdsInCriterion?.map((testId) => ({
        test_id:
          allTests.find(
            (test) => test.tes?.toLowerCase() === testId?.toLowerCase(),
          )?.id || "",
        relation: relMtvMetricTest,
      }));

      const createTestPromise = mutateCreateTest
        .mutateAsync()
        .then((newTest) => {
          alert.current = {
            message: t("page_tests.toast_create_success"),
          };

          // Add the newly created test to the metric assignment
          metricAssignment.push({
            test_id: newTest.id,
            relation: relMtvMetricTest,
          });

          // Now execute the assignment to metric after successful test creation
          const assignTestsToMetricPromise = mutationUpdateMetricTests
            .mutateAsync(metricAssignment)
            .catch((err) => {
              alert.current = {
                message: t("page_motivations.toast_assign_metric_fail"),
              };
              throw err;
            })
            .then(() => {
              alert.current = {
                message: t("page_motivations.toast_assign_metric_success"),
              };
              refetchAssessmentData();
              resetTestStates();
            });

          toast.promise(assignTestsToMetricPromise, {
            loading: t("toast_assign_metric_progress"),
            success: () => alert.current.message,
            error: () => alert.current.message,
          });

          setIsTestSelected(false);
        })
        .catch((err) => {
          alert.current = {
            message: "Error: " + err.response.data.message,
          };
          throw err;
        });

      toast.promise(createTestPromise, {
        loading: t("page_tests.toast_create_progress"),
        success: () => alert.current.message,
        error: () => alert.current.message,
      });
    } else if (formMode === "edit") {
      const updateTestPromise = mutateUpdateTest
        .mutateAsync()
        .then(() => {
          alert.current = {
            message: t("page_tests.toast_update_success"),
          };
          refetchAssessmentData();
          resetTestStates();
        })
        .catch((err) => {
          alert.current = {
            message: "Error: " + err.response.data.message,
          };
          throw err;
        });

      toast.promise(updateTestPromise, {
        loading: t("page_tests.toast_update_progress"),
        success: () => alert.current.message,
        error: () => alert.current.message,
      });
    }
  };

  return (
    <div
      className={`${styles["test-preview-modal"]} border rounded px-3 py-2 ${testToEdit && "my-4"}`}
    >
      <div className={`${styles["form-group-test-preview"]} mb-2`}>
        <div className={styles["test-params-fields-col"]}>
          <label className={styles["form-group-test-preview-label"]}>
            Test Information
          </label>

          <div className={styles["form-group-parameter"]}>
            <label htmlFor="input-test-tes">TES (*):</label>
            <input
              className={styles["form-control"]}
              disabled={formMode === "edit"}
              type="text"
              id="input-test-tes"
              value={test.tes}
              onChange={(e) =>
                setTest((prev) => ({ ...prev, tes: e.target.value }))
              }
              placeholder="Enter test identifier"
            />
            {showErrors && test.tes === "" && (
              <span className={styles["invalid-feedback"]}>
                {t("required")}
              </span>
            )}
          </div>

          <div className={styles["form-group-parameter"]}>
            <label htmlFor="input-test-label">Label (*):</label>
            <input
              type="text"
              id="input-test-label"
              value={test.label}
              onChange={(e) =>
                setTest((prev) => ({ ...prev, label: e.target.value }))
              }
              className={styles["form-control"]}
              placeholder="Enter test label"
            />
            {showErrors && test.label === "" && (
              <span className={styles["invalid-feedback"]}>
                {t("required")}
              </span>
            )}
          </div>

          <div className={styles["form-group-parameter"]}>
            <label htmlFor="input-test-description">Description (*):</label>
            <textarea
              id="input-test-description"
              rows={4}
              value={test.description}
              onChange={(e) =>
                setTest((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className={styles["form-control"]}
              placeholder="Enter test description"
            />
            {showErrors && test.description === "" && (
              <span className={styles["invalid-feedback"]}>
                {t("required")}
              </span>
            )}
          </div>
        </div>

        <div className={styles["test-params-fields-col"]}>
          {params?.length > 0 && (
            <label className={styles["form-group-test-preview-label"]}>
              {params?.length === 1 ? "Method Parameter" : "Method Parameters"}
              {testMethodName && (
                <span className="fw-light">: ({testMethodName})</span>
              )}
            </label>
          )}

          {params?.length > 0 &&
            params.map((param, index) => (
              <div key={param.id}>
                <div className={styles["form-group-parameter"]}>
                  <label className="fw-medium small">
                    {params?.length === 1
                      ? "Parameter Name (*)"
                      : `Parameter Name ${index + 1} (*)`}
                  </label>
                  <input
                    type="text"
                    className={styles["form-control"]}
                    value={param.name}
                    onChange={(e) =>
                      updateParam(param.id, "name", e.target.value)
                    }
                    placeholder="Enter parameter name"
                  />
                </div>
                {showErrors && param.name === "" && (
                  <span className={styles["invalid-feedback"]}>
                    {t("required")}
                  </span>
                )}

                <div className={styles["form-group-parameter"]}>
                  <label className="fw-medium small">
                    {params?.length === 1
                      ? "Question (*)"
                      : `Question ${index + 1} (*)`}
                  </label>
                  <textarea
                    rows={2}
                    className={styles["form-control"]}
                    value={param.text}
                    onChange={(e) =>
                      updateParam(param.id, "text", e.target.value)
                    }
                    placeholder="Enter the question"
                  />
                </div>
                {showErrors && param.text === "" && (
                  <span className={styles["invalid-feedback"]}>
                    {t("required")}
                  </span>
                )}

                <div className={styles["form-group-parameter"]}>
                  <label className="fw-medium small">
                    {params?.length === 1
                      ? "Help Text (*)"
                      : `Help Text ${index + 1} (*)`}
                  </label>
                  <textarea
                    rows={2}
                    className={styles["form-control"]}
                    value={param.tooltip}
                    onChange={(e) =>
                      updateParam(param.id, "tooltip", e.target.value)
                    }
                    placeholder="Enter helpful guidance"
                  />
                </div>
                {showErrors && param.tooltip === "" && (
                  <span className={styles["invalid-feedback"]}>
                    {t("required")}
                  </span>
                )}
              </div>
            ))}

          <div className={styles["evidence-parameter-option"]}>
            <label className="fw-medium small">Evidence Parameter</label>
            <OverlayTrigger
              placement="top"
              overlay={
                <Tooltip id="evidence-tooltip">
                  Please provide an evidence of via a public source or URL to
                  validate the information with an official reference.
                </Tooltip>
              }
            >
              <span className="ms-1">
                <FaInfoCircle className="mb-1" />
              </span>
            </OverlayTrigger>
            <Form.Check
              className="mt-1"
              aria-label="evidence-toggle"
              checked={hasEvidence}
              id="evidence-toggle"
              onChange={(e) => {
                setHasEvidence(e.target.checked);
              }}
              type="switch"
            />
          </div>
        </div>
      </div>

      <div className="mb-3">
        <label
          className={styles["form-group-test-preview-label"]}
          style={{ marginBottom: "0.5rem", width: "fit-content" }}
        >
          Preview Test
        </label>
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
        />
      </div>

      <div className={styles["form-actions-tests"]}>
        <button
          type="button"
          className={styles["btn-secondary"]}
          onClick={handleCancel}
        >
          Cancel
        </button>
        <button
          type="button"
          className={styles["btn-primary"]}
          onClick={handleSubmit}
        >
          {testToEdit ? "Update Test" : "Create Test"}
        </button>
      </div>
    </div>
  );
}

export default PreviewTests;
