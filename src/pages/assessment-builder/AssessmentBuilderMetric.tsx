import { useContext, useEffect, useRef, useState, useMemo } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import {
  AssessmentBuilderState,
  AssessmentPrinciple,
  MetricFull,
  AlertInfo,
} from "@/types";
import styles from "./AssessmentBuilder.module.css";
import { FaExclamationCircle } from "react-icons/fa";
import {
  useGetAllAlgorithms,
  useGetAllBenchmarkTypes,
} from "@/api/services/registry";
import {
  useCreateMotivationMetric,
  useUpdateMotivationAssignMetric,
} from "@/api/services/motivations";
import { AuthContext } from "@/auth";
import { relMtvPrincpleCriterion } from "@/config";
import toast from "react-hot-toast";

interface MetricConfiguration {
  mtr: string;
  label: string;
  description: string;
  url: string;
  type_metric_id: string;
  type_algorithm_id: string;
  type_benchmark_id: string;
  value_benchmark: number;
  criterion_id: string;
  type_algorithm_label?: string;
  type_benchmark_label?: string;
}

interface AssessmentBuilderMetricProps {
  assessment: AssessmentPrinciple[];
  builderState: AssessmentBuilderState;
  setBuilderState: React.Dispatch<React.SetStateAction<AssessmentBuilderState>>;
  setAssessment: React.Dispatch<React.SetStateAction<AssessmentPrinciple[]>>;
  mtvId?: string;
  criterionPidGraph?: string;
  motivationMetrics?: MetricFull[];
  refetchAssessmentData: () => void;
  isConfiguring: boolean;
  setIsConfiguring: React.Dispatch<React.SetStateAction<boolean>>;
  setIsPrincipleSelected: React.Dispatch<React.SetStateAction<boolean>>;
  setIsTestSelected: React.Dispatch<React.SetStateAction<boolean>>;
  setIsAlgorithmConfigured: React.Dispatch<React.SetStateAction<boolean>>;
}

function AssessmentBuilderMetric({
  assessment,
  builderState,
  setBuilderState,
  setAssessment,
  mtvId,
  criterionPidGraph,
  motivationMetrics,
  refetchAssessmentData,
  isConfiguring,
  setIsConfiguring,
  setIsPrincipleSelected,
  setIsTestSelected,
  setIsAlgorithmConfigured,
}: AssessmentBuilderMetricProps) {
  const { keycloak, registered } = useContext(AuthContext)!;
  const [isLoading, setIsLoading] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [metricConfig, setMetricConfig] = useState<MetricConfiguration>({
    mtr: " ",
    label: " ",
    description: " ",
    url: "",
    type_metric_id: "pid_graph:8D79984F",
    type_algorithm_id: "",
    type_benchmark_id: "",
    value_benchmark: 0,
    criterion_id: criterionPidGraph || "",
    type_algorithm_label: "",
    type_benchmark_label: "",
  });
  const { t } = useTranslation();
  const alert = useRef<AlertInfo>({
    message: "",
  });

  useEffect(() => {
    setShowErrors(false);

    const defaultConfig = {
      mtr: " ",
      label: " ",
      description: " ",
      url: "",
      type_metric_id: "pid_graph:8D79984F",
      type_algorithm_id: "",
      type_benchmark_id: "",
      value_benchmark: 0,
      criterion_id: criterionPidGraph || "",
      type_algorithm_label: "",
      type_benchmark_label: "",
    };

    // Find the current criterion in the assessment data
    const currentCriterion = assessment
      ?.flatMap((principle) => principle.criteria)
      .find((criterion) => criterion.id === builderState.selectedId);

    // Check if criterion has a metric and find corresponding motivation metric
    if (
      currentCriterion?.metric &&
      motivationMetrics &&
      motivationMetrics.length > 0
    ) {
      const assessmentMetric = currentCriterion.metric;

      if (assessmentMetric?.id) {
        // find selected metric in motivationMetrics compares assessmentMetric.id with motivationMetrics field "mtr"
        const matchingMotivationMetric = motivationMetrics.find(
          (metric) => metric.metric_mtr === assessmentMetric.id,
        );

        if (matchingMotivationMetric) {
          const existingMetricConfig = {
            ...defaultConfig,
            type_metric_id:
              matchingMotivationMetric.type_metric_id || "pid_graph:8D79984F",
            type_algorithm_id: matchingMotivationMetric.type_algorithm_id || "",
            type_benchmark_id: matchingMotivationMetric.type_benchmark_id || "",
            value_benchmark:
              Number(matchingMotivationMetric.value_benchmark) ||
              Number(assessmentMetric.benchmark_value) ||
              0,
          };
          setMetricConfig(existingMetricConfig);
          return;
        }
      }
    }

    // If no existing configuration found, use default config
    setMetricConfig(defaultConfig);
  }, [
    criterionPidGraph,
    assessment,
    motivationMetrics,
    builderState.selectedId,
  ]);

  const createMetricMutation = useCreateMotivationMetric(
    keycloak?.token || "",
    mtvId || "",
    // Filter out criterion_id if it's empty, null, or undefined
    {
      mtr: metricConfig.mtr,
      label: metricConfig.label,
      description: metricConfig.description,
      url: metricConfig.url,
      type_metric_id: metricConfig.type_metric_id,
      type_algorithm_id: metricConfig.type_algorithm_id,
      type_benchmark_id: metricConfig.type_benchmark_id,
      value_benchmark: metricConfig.value_benchmark,
      ...(metricConfig.criterion_id &&
        metricConfig.criterion_id.trim() !== "" && {
          criterion_id: metricConfig.criterion_id,
        }),
    },
  );

  const assignMetricMutation = useUpdateMotivationAssignMetric(
    keycloak?.token || "",
    mtvId || "",
    criterionPidGraph || "",
  );

  const { data: algorithmsData } = useGetAllAlgorithms({
    size: 20,
    token: keycloak?.token || "",
    isRegistered: registered,
    enabled: true,
  });

  const { data: benchmarkTypesData } = useGetAllBenchmarkTypes({
    size: 20,
    token: keycloak?.token || "",
    isRegistered: registered,
    enabled: true,
  });

  const algorithms =
    algorithmsData?.pages?.flatMap((page) => page.content) || [];
  const benchmarkTypes =
    benchmarkTypesData?.pages?.flatMap((page) => page.content) || [];

  const handleSaveAlgorithmConfiguration = async () => {
    try {
      setIsLoading(true);
      setShowErrors(true);

      const metricResponse = await createMetricMutation.mutateAsync();
      const assignmentData = {
        metric_id: metricResponse.metric_id,
        relation: relMtvPrincpleCriterion,
      };

      const promise = assignMetricMutation
        .mutateAsync(assignmentData)
        .then(() => {
          alert.current = {
            message: t(
              "page_motivations.toast_assign_metric_criterion_success",
            ),
          };

          // Check if the current criterion has a principle or not
          const criterionPrinciple = assessment.find((principle) =>
            principle.criteria?.some(
              (criterion) => criterion.id === builderState.selectedId,
            ),
          );

          if (criterionPrinciple && criterionPrinciple.id !== "untagged") {
            // Criterion has a principle, refetch the assessment data
            refetchAssessmentData();
          } else {
            // Criterion doesn't have a principle or is untagged, update local assessment array
            setAssessment((prevAssessment) => {
              return prevAssessment.map((principle) => ({
                ...principle,
                criteria:
                  principle.criteria?.map((criterion) => {
                    if (criterion.id === builderState.selectedId) {
                      return {
                        ...criterion,
                        metric: {
                          ...criterion.metric,
                          id: metricResponse.metric_mtr,
                          name: metricConfig.label,
                          description: metricConfig.description,
                          algorithm_type: metricConfig.type_algorithm_id,
                          benchmark_type: metricConfig.type_benchmark_id,
                          benchmark_value: metricConfig.value_benchmark,
                          type: criterion.metric?.type || "",
                          label_algorithm_type:
                            metricConfig.type_algorithm_label || "",
                          label_type_metric:
                            criterion.metric?.label_type_metric || "",
                          value: criterion.metric?.value || null,
                          result: criterion.metric?.result || null,
                          tests: criterion.metric?.tests || [],
                        },
                      };
                    }
                    return criterion;
                  }) || [],
              }));
            });
          }
        })
        .catch((err) => {
          alert.current = {
            message: t("page_motivations.toast_assign_metric_criterion_fail"),
          };
          throw err;
        });

      toast.promise(promise, {
        loading: "Saving algorithm configuration...",
        success: () => `${alert.current.message}`,
        error: () => `${alert.current.message}`,
      });

      setIsConfiguring(false);
      setShowErrors(false);
    } catch (error) {
      console.error("Error saving algorithm configuration:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Check if algorithm configuration is complete based on saved assessment data (not form state)
  const isAlgorithmConfigured = useMemo(() => {
    // Find the current criterion in the assessment data
    const currentCriterion = assessment
      ?.flatMap((principle) => principle.criteria)
      .find((criterion) => criterion.id === builderState.selectedId);

    // Check if criterion has a metric and find corresponding motivation metric
    if (
      currentCriterion?.metric &&
      motivationMetrics &&
      motivationMetrics.length > 0
    ) {
      const assessmentMetric = currentCriterion.metric;

      if (assessmentMetric?.id) {
        // Find selected metric in motivationMetrics compares assessmentMetric.id with motivationMetrics field "mtr"
        const matchingMotivationMetric = motivationMetrics.find(
          (metric) => metric.metric_mtr === assessmentMetric.id,
        );

        if (matchingMotivationMetric) {
          // Check if both algorithm_type and benchmark_type are configured in the saved data
          return Boolean(
            matchingMotivationMetric.type_algorithm_id &&
              matchingMotivationMetric.type_benchmark_id,
          );
        }
      }
    }

    return false;
  }, [assessment, motivationMetrics, builderState.selectedId]);

  // Notify parent component of configuration status changes
  useEffect(() => {
    setIsAlgorithmConfigured(isAlgorithmConfigured);
  }, [isAlgorithmConfigured, setIsAlgorithmConfigured]);

  return (
    <div>
      <div
        className={`${styles["algorithm-config-container"]} ${isConfiguring ? styles["expanded"] : ""}`}
      >
        <div
          className={`${styles["config-header"]} ${isConfiguring ? styles["expanded"] : ""}`}
          onClick={() => {
            setIsConfiguring((prev) => {
              if (!prev) {
                setIsPrincipleSelected(false);
                setIsTestSelected(false);
                return true;
              }
              return false;
            });
            if (isConfiguring) {
              setBuilderState((prevState) => ({
                ...prevState,
                entityMode: "criterion",
                formMode: "edit",
              }));
            } else {
              setBuilderState((prevState) => ({
                ...prevState,
                entityMode: "criterion",
                formMode: "edit",
              }));
            }
          }}
        >
          <div className={styles["config-header-left"]}>
            <span
              className={styles["config-header-title"]}
              style={{ color: "grey" }}
            >
              {isAlgorithmConfigured ? (
                <>
                  <span className="me-2">Algorithm has been configured</span> ✅
                </>
              ) : (
                "Configure Algorithm"
              )}
            </span>
            {!isAlgorithmConfigured && (
              <OverlayTrigger
                placement="top"
                overlay={
                  <Tooltip id="algorithm-config-tooltip">
                    Algorithm configuration is required. Please set the
                    algorithm type, benchmark type, and benchmark value to
                    complete your assessment setup.
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
              className={`${styles["config-edit-btn"]} ${isConfiguring ? styles["selected"] : ""}`}
            >
              {isConfiguring ? "Collapse" : "Expand"}
            </button>
          </div>
        </div>

        {/* Configuration Panel */}
        {isConfiguring && (
          <div className={styles["algorithm-config-content"]}>
            <div className={styles["config-panel-content"]}>
              {/* Algorithm Type Section */}
              <div className={styles["metric-section"]}>
                <div className={styles["section-header"]}>
                  <span className={styles["section-icon"]}>⚙️</span>
                  <h6 className={styles["section-title"]}>Algorithm Type</h6>
                  {showErrors && !metricConfig?.type_algorithm_id && (
                    <span className={`mx-2 ${styles["invalid-feedback"]}`}>
                      {t("required")}
                    </span>
                  )}
                </div>

                <div className={styles["algorithm-options-compact"]}>
                  {algorithms?.length > 0 &&
                    algorithms.map((algorithm) => {
                      // Determine icon based on algorithm functionality
                      const getAlgorithmIcon = (label: string) => {
                        const lowerLabel = label.toLowerCase();
                        if (
                          lowerLabel.includes("weighted") ||
                          lowerLabel.includes("weight")
                        ) {
                          return "📊"; // Chart for weighted calculations
                        } else if (
                          lowerLabel.includes("average") ||
                          lowerLabel.includes("mean")
                        ) {
                          return "⚖️"; // Balance scale for averaging
                        } else if (
                          lowerLabel.includes("binary") ||
                          lowerLabel.includes("pass") ||
                          lowerLabel.includes("fail")
                        ) {
                          return "✔️"; // Check mark for binary/pass-fail
                        } else if (
                          lowerLabel.includes("sum") ||
                          lowerLabel.includes("total")
                        ) {
                          return "➕"; // Plus for summation
                        } else if (
                          lowerLabel.includes("max") ||
                          lowerLabel.includes("maximum")
                        ) {
                          return "🔺"; // Triangle up for maximum
                        } else if (
                          lowerLabel.includes("min") ||
                          lowerLabel.includes("minimum")
                        ) {
                          return "🔻"; // Triangle down for minimum
                        } else {
                          return "🔢"; // Numbers for generic algorithms
                        }
                      };

                      return (
                        <div
                          key={algorithm.id}
                          className={styles["algorithm-option-compact"]}
                        >
                          <input
                            type="radio"
                            id={algorithm.id}
                            name="algorithm"
                            value={algorithm.id}
                            checked={
                              metricConfig.type_algorithm_id === algorithm.id
                            }
                            onChange={(e) =>
                              setMetricConfig((prev) => ({
                                ...prev,
                                type_algorithm_id: e.target.value,
                                type_algorithm_label: algorithm.label,
                              }))
                            }
                          />
                          <label
                            htmlFor={algorithm.id}
                            className={styles["algorithm-label-compact"]}
                          >
                            <span className={styles["algorithm-icon-small"]}>
                              {getAlgorithmIcon(algorithm.label)}
                            </span>
                            <span className={styles["algorithm-name-small"]}>
                              {algorithm.label}
                            </span>
                          </label>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Benchmark Type Section */}
              <div className={styles["metric-section"]}>
                <div className={styles["section-header"]}>
                  <span className={styles["section-icon"]}>🎯</span>
                  <h6 className={styles["section-title"]}>Benchmark Type</h6>
                  {showErrors && !metricConfig?.type_benchmark_id && (
                    <span className={`mx-2 {styles["invalid-feedback"]}`}>
                      {t("required")}
                    </span>
                  )}
                </div>

                <div className={styles["benchmark-options-compact"]}>
                  {benchmarkTypes?.length > 0 &&
                    benchmarkTypes.map((benchmarkType) => {
                      const getBenchmarkIcon = (label: string) => {
                        const lowerLabel = label?.toLowerCase();
                        if (lowerLabel?.includes("assessment outcome")) {
                          return "📊";
                        } else if (lowerLabel?.includes("string-string")) {
                          return "🔗";
                        } else if (lowerLabel?.includes("binary-binary")) {
                          return "🔀";
                        } else if (lowerLabel?.includes("string-binary")) {
                          return "📝";
                        } else if (
                          lowerLabel?.includes("normalised value-binary")
                        ) {
                          return "📊";
                        } else if (
                          lowerLabel?.includes("normalised value-performance")
                        ) {
                          return "📈";
                        } else if (lowerLabel?.includes("integer-binary-and")) {
                          return "🔒";
                        } else if (lowerLabel?.includes("integer-binary-or")) {
                          return "🔓";
                        } else if (lowerLabel?.includes("value-binary")) {
                          return "⚖️";
                        } else if (
                          lowerLabel?.includes("value-binary-inverse")
                        ) {
                          return "🔄";
                        } else {
                          return "📏";
                        }
                      };

                      return (
                        <div
                          key={benchmarkType.id}
                          className={styles["benchmark-option-compact"]}
                        >
                          <OverlayTrigger
                            placement="top"
                            delay={{ show: 150, hide: 50 }}
                            overlay={
                              <Tooltip
                                id={`benchmark-tooltip-${benchmarkType.id}`}
                                className={styles["benchmark-tooltip"]}
                              >
                                <div
                                  className={
                                    styles["benchmark-tooltip-content"]
                                  }
                                >
                                  <div
                                    className={
                                      styles["benchmark-tooltip-header"]
                                    }
                                  >
                                    <strong>{benchmarkType.label}</strong>
                                  </div>
                                  <div
                                    className={`${styles["benchmark-tooltip-pattern"]} badge bg-primary-cat`}
                                  >
                                    <span
                                      className={
                                        styles[
                                          "benchmark-tooltip-pattern-label"
                                        ]
                                      }
                                    >
                                      Pattern:
                                    </span>
                                    <span
                                      className={
                                        styles[
                                          "benchmark-tooltip-pattern-value"
                                        ]
                                      }
                                    >
                                      {benchmarkType.pattern}
                                    </span>
                                  </div>
                                  <div
                                    className={
                                      styles["benchmark-tooltip-description"]
                                    }
                                  >
                                    {benchmarkType.description}
                                  </div>
                                  {benchmarkType.example &&
                                    benchmarkType.example !== "N/A" && (
                                      <div
                                        className={
                                          styles["benchmark-tooltip-example"]
                                        }
                                      >
                                        <span
                                          className={
                                            styles[
                                              "benchmark-tooltip-example-label"
                                            ]
                                          }
                                        >
                                          Example:
                                        </span>
                                        <span
                                          className={
                                            styles[
                                              "benchmark-tooltip-example-value"
                                            ]
                                          }
                                        >
                                          {benchmarkType.example}
                                        </span>
                                      </div>
                                    )}
                                </div>
                              </Tooltip>
                            }
                          >
                            <div
                              className={`${styles["benchmark-option-card"]} ${
                                metricConfig.type_benchmark_id ===
                                benchmarkType.id
                                  ? styles["selected"]
                                  : ""
                              }`}
                              onClick={() =>
                                setMetricConfig((prev) => ({
                                  ...prev,
                                  type_benchmark_id: benchmarkType.id,
                                  type_benchmark_label: benchmarkType.label,
                                }))
                              }
                            >
                              <input
                                className={styles["no-display"]}
                                type="radio"
                                id={benchmarkType.id}
                                name="benchmark"
                                value={benchmarkType.id}
                                checked={
                                  metricConfig.type_benchmark_id ===
                                  benchmarkType.id
                                }
                                onChange={() => {}}
                              />
                              <div className={styles["benchmark-content"]}>
                                <div
                                  className={styles["benchmark-header-compact"]}
                                >
                                  <span
                                    className={styles["benchmark-icon-small"]}
                                  >
                                    {getBenchmarkIcon(benchmarkType.label)}
                                  </span>
                                  <span
                                    className={styles["benchmark-name-small"]}
                                  >
                                    {benchmarkType.label}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </OverlayTrigger>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Benchmark Value Section */}
              <div className={styles["metric-section"]}>
                <div className={styles["section-header"]}>
                  <span className={styles["section-icon"]}>🔢</span>
                  <h6 className={styles["section-title"]}>Benchmark Value</h6>
                </div>
                <div className={styles["benchmark-value-spinner"]}>
                  <button
                    className={styles["spinner-btn"]}
                    type="button"
                    onClick={() =>
                      setMetricConfig((prev) => ({
                        ...prev,
                        value_benchmark: Math.max(
                          0,
                          Number(prev?.value_benchmark || 1) - 1,
                        ),
                      }))
                    }
                  >
                    ▼
                  </button>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={metricConfig.value_benchmark?.toString() || "0"}
                    onChange={(e) =>
                      setMetricConfig((prev) => ({
                        ...prev,
                        value_benchmark: Number(e.target.value) || 0,
                      }))
                    }
                    className={styles["spinner-input"]}
                    readOnly
                  />
                  <button
                    className={styles["spinner-btn"]}
                    type="button"
                    onClick={() =>
                      setMetricConfig((prev) => ({
                        ...prev,
                        value_benchmark: Number(prev.value_benchmark || 0) + 1,
                      }))
                    }
                  >
                    ▲
                  </button>
                </div>
                <small className={styles["value-help-small"]}>
                  The minimum score required for this criterion to pass
                </small>
              </div>
            </div>

            <div className={styles["config-panel-actions"]}>
              <button
                className={styles["config-cancel-btn"]}
                onClick={() => {
                  setIsConfiguring(false);
                  setShowErrors(false);
                }}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                className={styles["config-save-btn"]}
                onClick={handleSaveAlgorithmConfiguration}
                disabled={isLoading}
              >
                {isLoading
                  ? "Saving..."
                  : isAlgorithmConfigured
                    ? "Update Configuration"
                    : "Save Configuration"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AssessmentBuilderMetric;
