import { useContext, useEffect, useRef, useState } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import {
  AssessmentBuilderState,
  AssessmentPrinciple,
  AssessmentCriterionImperative,
  MetricFull,
  AlertInfo,
} from "@/types";
import styles from "./AssessmentBuilder.module.css";
import { FaInfoCircle } from "react-icons/fa";
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
}

interface AssessmentBuilderPreviewProps {
  assessment: AssessmentPrinciple[];
  builderState: AssessmentBuilderState;
  setBuilderState: React.Dispatch<React.SetStateAction<AssessmentBuilderState>>;
  mtvId?: string;
  criterionPidGraph?: string;
  motivationMetrics?: MetricFull[];
  refetchAssessmentData: () => void;
}

function AssessmentBuilderPreview({
  mtvId,
  criterionPidGraph,
  assessment,
  builderState,
  setBuilderState,
  motivationMetrics,
  refetchAssessmentData,
}: AssessmentBuilderPreviewProps) {
  const { keycloak, registered } = useContext(AuthContext)!;
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPrincipleSelected, setIsPrincipleSelected] = useState(false);
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
  });
  const { t } = useTranslation();
  const alert = useRef<AlertInfo>({
    message: "",
  });

  useEffect(() => {
    setIsConfiguring(false);
    setIsPrincipleSelected(false);
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
          refetchAssessmentData();
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
                  setIsPrincipleSelected((prev) => !prev);
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
                        Add a principle
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
                        <span className={styles["config-btn-warning"]}>⚠️</span>
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
              <div>
                <div
                  className={`${styles["algorithm-config-container"]} ${isConfiguring ? styles["expanded"] : ""}`}
                >
                  <div
                    className={`${styles["config-header"]} ${isConfiguring ? styles["expanded"] : ""}`}
                    onClick={() => setIsConfiguring((prev) => !prev)}
                  >
                    <div className={styles["config-header-left"]}>
                      <span
                        className={styles["config-header-title"]}
                        style={{ color: "grey" }}
                      >
                        Configure Algorithm
                      </span>
                      {!(
                        metricConfig?.type_algorithm_id &&
                        metricConfig?.type_benchmark_id
                      ) && (
                        <OverlayTrigger
                          placement="top"
                          overlay={
                            <Tooltip id="algorithm-config-tooltip">
                              Algorithm configuration is required. Please set
                              the algorithm type, benchmark type, and benchmark
                              value to complete your assessment setup.
                            </Tooltip>
                          }
                        >
                          <span className={styles["config-btn-warning"]}>
                            ⚠️
                          </span>
                        </OverlayTrigger>
                      )}
                    </div>
                    <div className={styles["config-header-right"]}>
                      <button
                        className={`${styles["config-edit-btn"]} ${isConfiguring ? styles["selected"] : ""}`}
                      >
                        {isConfiguring ? "Editing" : "Edit"}
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
                            <span className={styles["section-icon"]}>🔢</span>
                            <h6 className={styles["section-title"]}>
                              Algorithm Type
                            </h6>
                            {showErrors && !metricConfig?.type_algorithm_id && (
                              <span className="mx-2 text-danger">
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
                                    className={
                                      styles["algorithm-option-compact"]
                                    }
                                  >
                                    <input
                                      type="radio"
                                      id={algorithm.id}
                                      name="algorithm"
                                      value={algorithm.id}
                                      checked={
                                        metricConfig.type_algorithm_id ===
                                        algorithm.id
                                      }
                                      onChange={(e) =>
                                        setMetricConfig((prev) => ({
                                          ...prev,
                                          type_algorithm_id: e.target.value,
                                        }))
                                      }
                                    />
                                    <label
                                      htmlFor={algorithm.id}
                                      className={
                                        styles["algorithm-label-compact"]
                                      }
                                    >
                                      <span
                                        className={
                                          styles["algorithm-icon-small"]
                                        }
                                      >
                                        {getAlgorithmIcon(algorithm.label)}
                                      </span>
                                      <span
                                        className={
                                          styles["algorithm-name-small"]
                                        }
                                      >
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
                            <h6 className={styles["section-title"]}>
                              Benchmark Type
                            </h6>
                            {showErrors && !metricConfig?.type_benchmark_id && (
                              <span className="mx-2 text-danger">
                                {t("required")}
                              </span>
                            )}
                          </div>

                          <div className={styles["benchmark-options-compact"]}>
                            {benchmarkTypes?.length > 0 &&
                              benchmarkTypes.map((benchmarkType) => {
                                // Determine icon based on benchmark functionality
                                const getBenchmarkIcon = (
                                  label: string,
                                  pattern: string,
                                ) => {
                                  const lowerLabel = label?.toLowerCase();
                                  const lowerPattern = pattern?.toLowerCase();

                                  if (
                                    lowerLabel?.includes("success") ||
                                    lowerLabel?.includes("pass") ||
                                    lowerPattern?.includes("≥")
                                  ) {
                                    return "✅"; // Green check for success rate
                                  } else if (
                                    lowerLabel?.includes("threshold") ||
                                    lowerPattern?.includes(">")
                                  ) {
                                    return "🎯"; // Target for threshold
                                  } else if (
                                    lowerLabel?.includes("accuracy") ||
                                    lowerLabel?.includes("precision")
                                  ) {
                                    return "🎪"; // Circus tent for precision/accuracy
                                  } else if (
                                    lowerLabel?.includes("error") ||
                                    lowerLabel?.includes("fail") ||
                                    lowerPattern?.includes("≤")
                                  ) {
                                    return "❌"; // Red X for error rate
                                  } else if (
                                    lowerLabel?.includes("time") ||
                                    lowerLabel?.includes("speed")
                                  ) {
                                    return "⏱️"; // Timer for performance
                                  } else if (
                                    lowerLabel?.includes("score") ||
                                    lowerLabel?.includes("rating")
                                  ) {
                                    return "⭐"; // Star for scoring
                                  } else if (
                                    lowerLabel?.includes("percentage") ||
                                    lowerPattern?.includes("%")
                                  ) {
                                    return "📊"; // Chart for percentage
                                  } else {
                                    return "📏"; // Ruler for generic measurement
                                  }
                                };

                                return (
                                  <div
                                    key={benchmarkType.id}
                                    className={
                                      styles["benchmark-option-compact"]
                                    }
                                  >
                                    <OverlayTrigger
                                      placement="top"
                                      delay={{ show: 150, hide: 50 }}
                                      overlay={
                                        <Tooltip
                                          id={`benchmark-tooltip-${benchmarkType.id}`}
                                          className={
                                            styles["benchmark-tooltip"]
                                          }
                                        >
                                          <div
                                            className={
                                              styles[
                                                "benchmark-tooltip-content"
                                              ]
                                            }
                                          >
                                            <div
                                              className={
                                                styles[
                                                  "benchmark-tooltip-header"
                                                ]
                                              }
                                            >
                                              <strong>
                                                {benchmarkType.label}
                                              </strong>
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
                                                styles[
                                                  "benchmark-tooltip-description"
                                                ]
                                              }
                                            >
                                              {benchmarkType.description}
                                            </div>
                                            {benchmarkType.example &&
                                              benchmarkType.example !==
                                                "N/A" && (
                                                <div
                                                  className={
                                                    styles[
                                                      "benchmark-tooltip-example"
                                                    ]
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
                                          onChange={() => {}} // Handled by onClick
                                        />
                                        <div
                                          className={
                                            styles["benchmark-content"]
                                          }
                                        >
                                          <div
                                            className={
                                              styles["benchmark-header-compact"]
                                            }
                                          >
                                            <span
                                              className={
                                                styles["benchmark-icon-small"]
                                              }
                                            >
                                              {getBenchmarkIcon(
                                                benchmarkType.label,
                                                benchmarkType.pattern,
                                              )}
                                            </span>
                                            <span
                                              className={
                                                styles["benchmark-name-small"]
                                              }
                                            >
                                              {benchmarkType.label}
                                            </span>
                                          </div>
                                          <div
                                            className={
                                              styles[
                                                "benchmark-pattern-compact"
                                              ]
                                            }
                                          >
                                            <small
                                              className={
                                                styles["pattern-label-small"]
                                              }
                                            >
                                              Pattern:
                                            </small>
                                            <span className="badge bg-primary-cat">
                                              {benchmarkType.pattern}
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
                            <h6 className={styles["section-title"]}>
                              Benchmark Value
                            </h6>
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
                              value={
                                metricConfig.value_benchmark?.toString() || "0"
                              }
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
                                  value_benchmark:
                                    Number(prev.value_benchmark || 0) + 1,
                                }))
                              }
                            >
                              ▲
                            </button>
                          </div>
                          <small className={styles["value-help-small"]}>
                            The minimum score required for this criterion to
                            pass
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
                          {isLoading ? "Saving..." : "Save Configuration"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
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
    </div>
  );
}

export default AssessmentBuilderPreview;
