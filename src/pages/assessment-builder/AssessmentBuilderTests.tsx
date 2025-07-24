import {
  useState,
  useContext,
  useMemo,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { useTranslation } from "react-i18next";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { FaInfoCircle } from "react-icons/fa";
import {
  AlertInfo,
  AssessmentBuilderState,
  AssessmentPrinciple,
  RegistryResource,
} from "@/types";
import { TestInput, TestParam } from "@/types/tests";
import {
  useCreateTest,
  useGetAllTestMethods,
  useGetAllTests,
} from "@/api/services/registry";
import { AuthContext } from "@/auth";
import styles from "./AssessmentBuilder.module.css";
import { FaClipboardQuestion } from "react-icons/fa6";
import { useUpdateMotivationMetricTests } from "@/api";
import { relMtvMetricTest } from "@/config";
import toast from "react-hot-toast";

interface AssessmentBuilderTestsProps {
  mtvId: string;
  mtrId: string;
  assessment: AssessmentPrinciple[];
  builderState: AssessmentBuilderState;
  setBuilderState: React.Dispatch<React.SetStateAction<AssessmentBuilderState>>;
  refetchAssessmentData: () => void;
  setIsTestSelected: React.Dispatch<React.SetStateAction<boolean>>;
}

function AssessmentBuilderTests({
  mtvId,
  mtrId,
  assessment,
  builderState,
  refetchAssessmentData,
  setBuilderState,
  setIsTestSelected,
}: AssessmentBuilderTestsProps) {
  const { t } = useTranslation();
  const { keycloak, registered } = useContext(AuthContext)!;
  const alert = useRef<AlertInfo>({
    message: "",
  });

  const [test, setTest] = useState<TestInput>({
    tes: "",
    label: "",
    description: "",
    test_method_id: "",
    label_test_definition: "",
    param_type: "onscreen",
  });
  const [params, setParams] = useState<TestParam[]>([]);
  const [hasEvidence, setHasEvidence] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selectedTestId, setSelectedTestId] = useState<string>("");

  const formMode = builderState.formMode;

  const getSearchString = () => {
    if (filterType === "manual") {
      return "Manual";
    } else if (filterType === "automated") {
      return "Auto";
    }
    return "";
  };

  const mutateCreateTest = useCreateTest(keycloak?.token || "", test);
  const mutationUpdate = useUpdateMotivationMetricTests(
    keycloak?.token || "",
    mtvId || "",
    mtrId || "",
  );

  const { data: testData } = useGetAllTests({
    size: 100,
    token: keycloak?.token || "",
    isRegistered: registered,
  });

  const allTests = useMemo(
    () => testData?.pages?.flatMap((page) => page.content) || [],
    [testData?.pages],
  );

  const filteredTests = useMemo(() => {
    // First, get all existing tests from the assessment
    const existingTestIds = assessment
      ?.flatMap((principle) => principle.criteria || [])
      ?.flatMap((criterion) => criterion?.metric?.tests || [])
      ?.map((test) => test?.id?.toLowerCase())
      ?.filter(Boolean);

    // Then filter allTests based on existence and search term
    return allTests?.filter((test) => {
      // Check if test already exists in assessment
      const existsInAssessment = existingTestIds?.includes(
        test.tes?.toLowerCase(),
      );

      if (!searchTerm) {
        return !existsInAssessment;
      }

      const term = searchTerm.toLowerCase();
      const matchesSearch =
        test.tes?.toLowerCase().includes(term) ||
        test.label?.toLowerCase().includes(term) ||
        test.description?.toLowerCase().includes(term);

      // For search results, also filter out existing tests
      return matchesSearch && !existsInAssessment;
    });
  }, [searchTerm, assessment, allTests]);

  const { data: testMethodsData } = useGetAllTestMethods({
    size: 100,
    token: keycloak?.token || "",
    isRegistered: registered,
    search: getSearchString(),
    enabled: true,
  });

  // Extract test methods from the paginated data structure
  const testMethods: RegistryResource[] =
    testMethodsData?.pages?.flatMap((page) => page.content) || [];

  const filteredTestMethods = testMethods.filter((method) => {
    const matchesSearch = method.label
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    if (filterType === "all") return matchesSearch;
    if (filterType === "manual")
      return matchesSearch && method.label.toLowerCase().includes("manual");
    if (filterType === "automated")
      return matchesSearch && !method.label.toLowerCase().includes("manual");

    return matchesSearch;
  });

  const addNewParams = useCallback((numberOfParams = 1) => {
    const tmpParams = Array.from(
      { length: numberOfParams },
      (_, i) => i + 1,
    )?.map((i) => ({
      id: i,
      name: "",
      text: "",
      tooltip: "",
    }));
    setParams(tmpParams);
  }, []);

  // Initialize test method to first available method
  useEffect(() => {
    if (testMethods?.length > 0 && !test?.test_method_id) {
      setTest((prevTest) => ({
        ...prevTest,
        test_method_id: testMethods[0]?.id || "",
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [test.test_method_id, JSON.stringify(testMethods)]);

  // Watch for changes in test_method_id to update the selected method parameters
  useEffect(() => {
    if (testMethods?.length > 0 && test.test_method_id) {
      const method = testMethods.find((m) => m.id === test.test_method_id);
      if (method) {
        addNewParams(method?.num_params);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [test.test_method_id, JSON.stringify(testMethods)]);

  const updateParam = (id: number, field: keyof TestParam, value: string) => {
    setParams((prev) =>
      prev.map((param) =>
        param.id === id ? { ...param, [field]: value } : param,
      ),
    );
  };

  const updateParamTestDef = () => {
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
  };

  const handleValidate = (): boolean => {
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
  };

  const handleCancel = () => {
    setBuilderState((prev) => ({
      ...prev,
      entityMode: "none",
      formMode: "none",
    }));
  };

  const handleSubmit = async () => {
    if (formMode === "new") {
      if (!handleValidate()) {
        return;
      }
    }
    const selectedCriterionId = builderState.selectedId;
    const existingTestIds: string[] = [];

    if (selectedCriterionId) {
      // Find the selected criterion in the assessment
      const selectedCriterion = assessment
        ?.flatMap((principle) => principle.criteria || [])
        ?.find((criterion) => criterion.id === selectedCriterionId);

      if (
        selectedCriterion?.metric?.tests &&
        selectedCriterion.metric.tests.length > 0
      ) {
        // Extract existing test IDs
        selectedCriterion.metric.tests.forEach((test) => {
          if (test.id) {
            existingTestIds.push(test.id);
          }
        });
      }
    }

    const metricAssignment = existingTestIds.map((testId) => ({
      test_id:
        allTests.find(
          (test) => test.tes?.toLowerCase() === testId?.toLowerCase(),
        )?.id || "",
      relation: relMtvMetricTest,
    }));

    if (
      formMode === "select" &&
      selectedTestId &&
      !existingTestIds.includes(selectedTestId)
    ) {
      metricAssignment.push({
        test_id: selectedTestId,
        relation: relMtvMetricTest,
      });
    }
    alert.current = {
      message:
        formMode === "new"
          ? "Test created successfully"
          : formMode === "edit"
            ? "Test updated successfully"
            : "Test selected successfully",
    };

    if (formMode === "new") {
      updateParamTestDef();

      await mutateCreateTest
        .mutateAsync()
        .catch((err) => {
          alert.current = {
            message: "Error: " + err.response.data.message,
          };
          throw err;
        })
        .then((newTest) => {
          alert.current = {
            message: t("page_tests.toast_create_success"),
          };

          metricAssignment.push({
            test_id: newTest.id,
            relation: relMtvMetricTest,
          });
        });
    }

    const promise = mutationUpdate
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

    toast.promise(promise, {
      loading: t("page_tests.toast_create_progress"),
      success: () => `${alert.current.message}`,
      error: () => `${alert.current.message}`,
    });

    setIsTestSelected(false);
  };

  return (
    <>
      {formMode === "select" ? (
        <div className={styles["principles-list-container"]}>
          <div className={styles["principles-list"]}>
            <div className={styles["principles-list-actions"]}>
              <button
                className={styles["select-principle-btn"]}
                onClick={handleSubmit}
                disabled={!selectedTestId}
              >
                Select Test
              </button>
            </div>

            <div className={styles["form-group"]}>
              <input
                type="text"
                className={`${styles["form-control"]} mb-1`}
                style={{ width: "98%", margin: "0 auto" }}
                placeholder="Search principles by ID, label or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {filteredTests.length === 0 ? (
              <p className={styles["no-principles"]}>
                {searchTerm
                  ? "No tests found matching your search"
                  : allTests.length === 0
                    ? "No test available"
                    : "All available tests have been added"}
              </p>
            ) : (
              <div className={styles["principles-grid"]}>
                {filteredTests?.map((test) => (
                  <div
                    key={test.id}
                    className={`${styles["principle-card"]} ${selectedTestId === test.id ? styles["selected"] : ""}`}
                    onClick={() => setSelectedTestId(test.id)}
                  >
                    <div className={styles["principle-card-compact-header"]}>
                      <FaClipboardQuestion
                        className={styles["principle-card-icon"]}
                      />

                      <span className={styles["principle-card-compact-title"]}>
                        <span className={styles["principle-card-pri"]}>
                          {test.tes}
                        </span>{" "}
                        - {test.label}
                      </span>
                    </div>
                    <p className={styles["principle-card-description"]}>
                      {test.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        formMode === "new" && (
          <div
            className={styles["builder-column"]}
            style={{ height: "92%", overflow: "auto" }}
          >
            <div>
              <div className={styles["principle-form"]}>
                <div className="mb-3">
                  <h4>Select a Test Method</h4>
                  {/* Search and Filter */}
                  <div className="mb-1">
                    {/* Compact Filter Options */}
                    <div className="d-flex gap-1 justify-content-center">
                      <div className="form-check form-check-inline">
                        <input
                          className="form-check-input"
                          type="radio"
                          id="filterAll"
                          name="filterType"
                          value="all"
                          checked={filterType === "all"}
                          onChange={() => setFilterType("all")}
                        />
                        <label
                          className="form-check-label small"
                          htmlFor="filterAll"
                        >
                          All
                        </label>
                      </div>
                      <div className="form-check form-check-inline">
                        <input
                          className="form-check-input"
                          type="radio"
                          id="filterManual"
                          name="filterType"
                          value="manual"
                          checked={filterType === "manual"}
                          onChange={() => setFilterType("manual")}
                        />
                        <label
                          className="form-check-label small"
                          htmlFor="filterManual"
                        >
                          Manual
                        </label>
                      </div>
                      <div className="form-check form-check-inline">
                        <input
                          className="form-check-input"
                          type="radio"
                          id="filterAuto"
                          name="filterType"
                          value="automated"
                          checked={filterType === "automated"}
                          onChange={() => setFilterType("automated")}
                        />
                        <label
                          className="form-check-label small"
                          htmlFor="filterAuto"
                        >
                          Auto
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Test Methods List - Compact */}
                  <div className={styles["test-methods-list"]}>
                    {filteredTestMethods?.map((method) => (
                      <div
                        key={method.id}
                        className={`${styles["test-method-item"]} ${
                          test.test_method_id === method.id
                            ? styles["selected"]
                            : ""
                        }`}
                        onClick={() =>
                          setTest((prev) => ({
                            ...prev,
                            test_method_id: method.id,
                          }))
                        }
                      >
                        <div className={styles["method-name"]}>
                          {method.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Parameters Section */}
                <div className="mb-3">
                  <div className="mb-1">
                    <h4>Test Method Parameters</h4>
                  </div>

                  {params.length === 0 && (
                    <div className="text-muted text-center py-2 border rounded small">
                      <p className="mb-1">No parameters configured.</p>
                      <small>
                        Parameters are automatically initialized based on the
                        selected test method.
                      </small>
                    </div>
                  )}

                  {params?.length > 0 &&
                    params.map((param, index) => (
                      <div
                        key={param.id}
                        className="mb-2 p-2 border rounded bg-light"
                      >
                        <div className="mb-1">
                          <h6 className="mb-0 fw-bold text-primary small">
                            Parameter {index + 1}
                          </h6>
                        </div>

                        <div className={styles["form-group-test"]}>
                          <label className="fw-medium small">
                            Parameter Name (*)
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

                        <div className={styles["form-group-test"]}>
                          <label className="fw-medium small">
                            Question (*)
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

                        <div className={styles["form-group-test"]}>
                          <label className="fw-medium small">
                            Help Text (*)
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

                  {/* Evidence Parameter Option */}
                  <div className="d-flex align-items-center mt-2 p-2 bg-light border rounded">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="evidence-parameter"
                        checked={hasEvidence}
                        onChange={(e) => setHasEvidence(e.target.checked)}
                      />
                      <label
                        className="form-check-label fw-medium small"
                        htmlFor="evidence-parameter"
                      >
                        Include Evidence Parameter
                      </label>
                    </div>
                    <OverlayTrigger
                      placement="top"
                      overlay={
                        <Tooltip id="evidence-tooltip">
                          Add a parameter for users to provide evidence via URL
                          or public source
                        </Tooltip>
                      }
                    >
                      <span className="ms-2 mb-1">
                        <FaInfoCircle />
                      </span>
                    </OverlayTrigger>
                  </div>
                </div>

                {/* Test Details Form */}
                <div>
                  <h4>Test Details</h4>

                  <div className={styles["form-group-test"]}>
                    <label htmlFor="input-test-tes">TES (*):</label>
                    <input
                      className={styles["form-control"]}
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

                  <div className={styles["form-group-test"]}>
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

                  <div className={styles["form-group-test"]}>
                    <label htmlFor="input-test-description">
                      Description (*):
                    </label>
                    <textarea
                      id="input-test-description"
                      rows={2}
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
                    Create Test
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      )}
    </>
  );
}

export default AssessmentBuilderTests;
