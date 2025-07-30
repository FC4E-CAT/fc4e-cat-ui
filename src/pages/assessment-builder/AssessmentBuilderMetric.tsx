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
import {
  useGetAllAlgorithms,
  useGetAllBenchmarkTypes,
} from "@/api/services/registry";
import { useUpdateMotivationAlgorithmSettings } from "@/api/services/motivations";
import { AuthContext } from "@/auth";
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
  mtvId?: string;
  mtrId?: string;
  refetchAssessmentData: () => void;
  criterionPidGraph?: string;
  motivationMetrics?: MetricFull[];
  setIsConfiguring: React.Dispatch<React.SetStateAction<boolean>>;
  onClose?: () => void;
}

function AssessmentBuilderMetric({
  assessment,
  builderState,
  mtvId,
  mtrId,
  refetchAssessmentData,
  criterionPidGraph,
  motivationMetrics,
  setIsConfiguring,
  onClose,
}: AssessmentBuilderMetricProps) {
  const { keycloak, registered } = useContext(AuthContext)!;
  const [isLoading, setIsLoading] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  const defaultConfig = useMemo(
    () => ({
      mtr: " ",
      label: " ",
      description: " ",
      url: "",
      type_metric_id: "pid_graph:8D79984F", // Binary
      type_algorithm_id: "pid_graph:AE39C968", // Simple Sum
      type_benchmark_id: "pid_graph:7085006F", // Binary-Binary
      value_benchmark: 1,
      criterion_id: criterionPidGraph || "",
      type_algorithm_label: "Simple Sum",
      type_benchmark_label: "Binary-Binary",
    }),
    [criterionPidGraph],
  );

  const [metricConfig, setMetricConfig] =
    useState<MetricConfiguration>(defaultConfig);
  const { t } = useTranslation();
  const alert = useRef<AlertInfo>({
    message: "",
  });

  useEffect(() => {
    setShowErrors(false);

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
    defaultConfig,
    criterionPidGraph,
    assessment,
    motivationMetrics,
    builderState.selectedId,
  ]);

  const mutateUpdateMotivationAlgorithm = useUpdateMotivationAlgorithmSettings(
    keycloak?.token || "",
    mtvId || "",
    mtrId || "",
    {
      type_algorithm_id: metricConfig.type_algorithm_id,
      type_benchmark_id: metricConfig.type_benchmark_id,
      value_benchmark: metricConfig.value_benchmark,
    },
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

      const algorithmDbId = assessment
        .flatMap((principle) => principle.criteria)
        .find((criterion) => criterion.id === builderState.selectedId)
        ?.metric?.db_id;

      console.log("algorithmDbId:", algorithmDbId);

      if (algorithmDbId) {
        const promise = mutateUpdateMotivationAlgorithm
          .mutateAsync()
          .then(() => {
            refetchAssessmentData();
          })
          .catch((err) => {
            alert.current = {
              message: t("page_motivations.toast_assign_metric_criterion_fail"),
            };
            throw err;
          })
          .finally(() => {
            toast.promise(promise, {
              loading: "Saving algorithm configuration...",
              success: () => "Saved algorithm configuration successfully",
              error: () => alert.current.message,
            });
          });
      }

      setIsConfiguring(false);
      setShowErrors(false);
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error("Error saving algorithm configuration:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
                      checked={metricConfig.type_algorithm_id === algorithm.id}
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
                  } else if (lowerLabel?.includes("normalised value-binary")) {
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
                  } else if (lowerLabel?.includes("value-binary-inverse")) {
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
                          <div className={styles["benchmark-tooltip-content"]}>
                            <div className={styles["benchmark-tooltip-header"]}>
                              <strong>{benchmarkType.label}</strong>
                            </div>
                            <div
                              className={`${styles["benchmark-tooltip-pattern"]} badge bg-primary-cat`}
                            >
                              <span
                                className={
                                  styles["benchmark-tooltip-pattern-label"]
                                }
                              >
                                Pattern:
                              </span>
                              <span
                                className={
                                  styles["benchmark-tooltip-pattern-value"]
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
                                      styles["benchmark-tooltip-example-label"]
                                    }
                                  >
                                    Example:
                                  </span>
                                  <span
                                    className={
                                      styles["benchmark-tooltip-example-value"]
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
                          metricConfig.type_benchmark_id === benchmarkType.id
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
                            metricConfig.type_benchmark_id === benchmarkType.id
                          }
                          onChange={() => {}}
                        />
                        <div className={styles["benchmark-content"]}>
                          <div className={styles["benchmark-header-compact"]}>
                            <span className={styles["benchmark-icon-small"]}>
                              {getBenchmarkIcon(benchmarkType.label)}
                            </span>
                            <span className={styles["benchmark-name-small"]}>
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
            if (onClose) {
              onClose();
            }
          }}
        >
          Cancel
        </button>
        <button
          className={styles["config-save-btn"]}
          onClick={handleSaveAlgorithmConfiguration}
        >
          {isLoading ? "Saving..." : "Save Configuration"}
        </button>
      </div>
    </div>
  );
}

export default AssessmentBuilderMetric;
