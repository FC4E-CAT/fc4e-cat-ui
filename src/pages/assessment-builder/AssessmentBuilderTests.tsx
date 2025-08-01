import { useState, useContext, useMemo, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  AlertInfo,
  AssessmentBuilderState,
  AssessmentPrinciple,
} from "@/types";
import { RegistryTest } from "@/types/tests";
import { AuthContext } from "@/auth";
import styles from "./AssessmentBuilder.module.css";
import { FaClipboardQuestion } from "react-icons/fa6";
import { useUpdateMotivationMetricTests } from "@/api";
import { relMtvMetricTest } from "@/config";
import toast from "react-hot-toast";
import TestsMethods from "./TestsMethods";

interface AssessmentBuilderTestsProps {
  mtvId: string;
  mtrId: string;
  assessment: AssessmentPrinciple[];
  builderState: AssessmentBuilderState;
  refetchAssessmentData: () => void;
  setIsTestSelected: React.Dispatch<React.SetStateAction<boolean>>;
  allTests: RegistryTest[];
}

function AssessmentBuilderTests({
  mtvId,
  mtrId,
  assessment,
  builderState,
  refetchAssessmentData,
  setIsTestSelected,
  allTests,
}: AssessmentBuilderTestsProps) {
  const { t } = useTranslation();
  const { keycloak } = useContext(AuthContext)!;
  const alert = useRef<AlertInfo>({
    message: "",
  });
  const formMode = builderState.formMode;

  const [searchTerm, setSearchTerm] = useState("");
  const [testId, setTestId] = useState<string>("");

  const mutationUpdateMetricTests = useUpdateMotivationMetricTests(
    keycloak?.token || "",
    mtvId || "",
    mtrId || "",
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

  const resetTestStates = () => {
    setTestId("");
    setSearchTerm("");
  };

  const handleSubmit = useCallback(() => {
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

    if (testId && !existingTestIds.includes(testId)) {
      metricAssignment.push({
        test_id: testId,
        relation: relMtvMetricTest,
      });
    }

    // For select mode, execute assignment directly
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
        resetTestStates();
      });

    toast.promise(assignTestsToMetricPromise, {
      loading: t("toast_assign_metric_progress"),
      success: () => alert.current.message,
      error: () => alert.current.message,
    });

    setIsTestSelected(false);
  }, [
    allTests,
    assessment,
    builderState,
    mutationUpdateMetricTests,
    refetchAssessmentData,
    setIsTestSelected,
    t,
    testId,
  ]);

  return (
    <>
      {formMode === "select" ? (
        <div className={styles["principles-list-container"]}>
          <div className={styles["principles-list"]}>
            <div className={styles["principles-list-actions"]}>
              <button
                className={styles["select-principle-btn"]}
                onClick={handleSubmit}
                disabled={!testId}
              >
                Select Test
              </button>
            </div>

            <div className={styles["form-group"]}>
              <input
                type="text"
                className={styles["form-control"]}
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
                    className={`${styles["principle-card"]} ${testId === test.id ? styles["selected"] : ""}`}
                    onClick={() => setTestId(test.id)}
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
          <div className={styles["builder-column"]}>
            <div className={styles["principle-form"]}>
              <TestsMethods />
            </div>
          </div>
        )
      )}
    </>
  );
}

export default AssessmentBuilderTests;
