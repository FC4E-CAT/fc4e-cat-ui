import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState, useContext, useEffect, useCallback } from "react";
import { Button, Container, Spinner } from "react-bootstrap";
import { FaEye } from "react-icons/fa";
import { AuthContext } from "@/auth";
import { useGetAllPrinciples, useGetMotivationAssessmentType } from "@/api";
import { useGetMotivationAssessmentTypeTemplate } from "@/api/services/motivations";
import {
  useGetMotivationCriteriaMutation,
  useGetAllMotivationMetrics,
} from "@/api/services/motivations";
import { useQueryClient } from "@tanstack/react-query";
import {
  type Principle,
  type AssessmentBuilderState,
  type RegistryMetric,
  type Criterion,
  type AssessmentTest,
  type AssessmentCriterion,
  type Assessment,
  type AssessmentPrinciple,
  AssessmentCriterionImperative,
  type AutoGroupTest,
} from "@/types";
import { useGetAllCriteria } from "../../api/services/criteria";
import { useGetAllTests } from "@/api/services/registry";
import type { RegistryTest } from "@/types/tests";
import ROUTES, { buildRoute } from "@/routes";
import { evalAssessment, evalMetric } from "@/utils";
import AssessmentBuilderStructure from "./AssessmentBuilderStructure";
import AssessmentBuilderPreview from "./AssessmentBuilderPreview";
import AssessmentBuilderCriteria from "./AssessmentBuilderCriteria";
import AssessmentBuilderPrinciples from "./AssessmentBuilderPrinciples";
import AssessmentBuilderTests from "./AssessmentBuilderTests";
import { canEditMetricAndTests } from "./utils";
import styles from "./AssessmentBuilder.module.css";
import AssessmentEvalStats from "./AssessmentEvalStats";

interface AssessmentBuilderProps {
  assessmentTemplate?: Assessment;
  setAssessmentTemplate?: React.Dispatch<
    React.SetStateAction<Assessment | undefined>
  >;
  isEditing?: boolean;
  onAutoTestGroup?: (autoGroup: AutoGroupTest) => void;
  onSaveAssessmentChanges?: (exit?: boolean) => void;
  onAssessmentSubmit?: (exit?: boolean) => void;
  wizardTabActive?: boolean;
  showTitle?: boolean;
}

function AssessmentBuilder({
  assessmentTemplate,
  setAssessmentTemplate,
  isEditing,
  onAutoTestGroup,
  onSaveAssessmentChanges,
  onAssessmentSubmit,
  wizardTabActive,
  showTitle = true,
}: AssessmentBuilderProps) {
  const { mtvId, actId } = useParams<{
    mtvId: string;
    actId: string;
  }>();

  const { keycloak, registered } = useContext(AuthContext)!;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { t } = useTranslation();

  const [builderState, setBuilderState] = useState<AssessmentBuilderState>({
    formMode: "none",
    entityMode: "none",
    selectedId: "",
    selectedPrincipleIndex: -1,
    selectedCriterionIndex: -1,
  });
  const [isPrincipleSelected, setIsPrincipleSelected] = useState(false);
  const [isTestSelected, setIsTestSelected] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const {
    data: assessmentData,
    refetch: refetchAssessmentData,
    isLoading,
  } = useGetMotivationAssessmentTypeTemplate(
    mtvId || "",
    actId || "",
    keycloak?.token || "",
    registered && !assessmentTemplate,
  );

  const { data: assessmentTemplateData } = useGetMotivationAssessmentType(
    mtvId || "",
    actId || "",
    keycloak?.token || "",
    registered && !assessmentTemplate,
  );

  const [assessment, setAssessment] = useState<AssessmentPrinciple[]>(
    assessmentData?.principles || [],
  );
  const [assessmentInfo, setAssessmentInfo] = useState<Assessment>();
  const [motivationMetrics, setMotivationMetrics] = useState<RegistryMetric[]>(
    [],
  );

  // Use props if available, otherwise use local state
  const currentAssessmentInfo = assessmentTemplate || assessmentInfo;
  const setCurrentAssessmentInfo = setAssessmentTemplate || setAssessmentInfo;

  const [allTests, setAllTests] = useState<RegistryTest[]>([]);
  const [allPrinciples, setAllPrinciples] = useState<Principle[]>([]);
  const [allCriteria, setAllCriteria] = useState<Criterion[]>([]);

  const {
    data: testsData,
    fetchNextPage: testFetchNextPage,
    hasNextPage: testsHaveNextPage,
    isFetchingNextPage: testsAreFetchingNextPage,
  } = useGetAllTests({
    size: 20,
    token: keycloak?.token || "",
    isRegistered: registered && isEditing === true,
  });

  const {
    data: principlesData,
    refetch: refetchPrinciples,
    fetchNextPage: principlesFetchNextPage,
    hasNextPage: principlesHaveNextPage,
    isFetchingNextPage: principlesAreFetchingNextPage,
  } = useGetAllPrinciples({
    token: keycloak?.token || "",
    isRegistered: registered && isEditing === true,
    size: 20,
  });

  const {
    data: criteriaData,
    fetchNextPage: criteriaFetchNextPage,
    hasNextPage: criteriaHaveNextPage,
    isFetchingNextPage: criteriaAreFetchingNextPage,
  } = useGetAllCriteria({
    size: 20,
    token: keycloak?.token || "",
    isRegistered: registered && isEditing === true,
  });

  useEffect(() => {
    if (testsData?.pages) {
      const allTestsData =
        testsData.pages.flatMap((page) => page.content) || [];
      setAllTests(allTestsData);

      if (testsHaveNextPage && !testsAreFetchingNextPage) {
        testFetchNextPage();
      }
    }
  }, [
    testsData?.pages,
    testsHaveNextPage,
    testsAreFetchingNextPage,
    testFetchNextPage,
  ]);

  useEffect(() => {
    if (principlesData?.pages) {
      const allPrinciplesData =
        principlesData.pages.flatMap((page) => page.content) || [];
      setAllPrinciples(allPrinciplesData);

      if (principlesHaveNextPage && !principlesAreFetchingNextPage) {
        principlesFetchNextPage();
      }
    }
  }, [
    principlesData?.pages,
    principlesHaveNextPage,
    principlesAreFetchingNextPage,
    principlesFetchNextPage,
  ]);

  useEffect(() => {
    if (criteriaData?.pages) {
      const allCriteriaData =
        criteriaData.pages.flatMap((page) => page.content) || [];
      setAllCriteria(allCriteriaData);

      if (criteriaHaveNextPage && !criteriaAreFetchingNextPage) {
        criteriaFetchNextPage();
      }
    }
  }, [
    criteriaData?.pages,
    criteriaHaveNextPage,
    criteriaAreFetchingNextPage,
    criteriaFetchNextPage,
  ]);

  useEffect(() => {
    if (assessmentTemplateData) {
      setCurrentAssessmentInfo(assessmentTemplateData);
    }
  }, [assessmentTemplateData, setCurrentAssessmentInfo]);

  useEffect(() => {
    if (
      assessmentData &&
      builderState.formMode === "none" &&
      builderState.entityMode === "none"
    ) {
      if (isEditing) {
        if (assessmentData?.principles?.[0]?.criteria?.length > 0) {
          setBuilderState({
            formMode: "edit",
            entityMode: "criterion",
            selectedId:
              assessmentData?.principles?.[0]?.criteria?.length > 0
                ? assessmentData?.principles?.[0]?.criteria?.[0]?.id
                : "",
            selectedPrincipleIndex:
              assessmentData?.principles?.length > 0 ? 0 : -1,
            selectedCriterionIndex:
              assessmentData?.principles?.[0]?.criteria?.length > 0 ? 0 : -1,
          });
        }
      } else if (
        assessmentTemplateData &&
        assessmentTemplateData?.principles?.[0]?.criteria?.length > 0
      ) {
        setBuilderState({
          formMode: "edit",
          entityMode: "criterion",
          selectedId:
            assessmentTemplateData?.principles?.[0]?.criteria?.length > 0
              ? assessmentTemplateData?.principles?.[0]?.criteria?.[0]?.id
              : "",
          selectedPrincipleIndex:
            assessmentTemplateData?.principles?.length > 0 ? 0 : -1,
          selectedCriterionIndex:
            assessmentTemplateData?.principles?.[0]?.criteria?.length > 0
              ? 0
              : -1,
        });
      }
    } else if (
      assessmentTemplate &&
      assessmentTemplate?.principles?.[0]?.criteria?.length > 0 &&
      builderState.formMode === "none" &&
      builderState.entityMode === "none"
    ) {
      setBuilderState({
        formMode: "edit",
        entityMode: "criterion",
        selectedId:
          assessmentTemplate?.principles?.[0]?.criteria?.length > 0
            ? assessmentTemplate?.principles?.[0]?.criteria?.[0]?.id
            : "",
        selectedPrincipleIndex:
          assessmentTemplate?.principles?.length > 0 ? 0 : -1,
        selectedCriterionIndex:
          assessmentTemplate?.principles?.[0]?.criteria?.length > 0 ? 0 : -1,
      });
    }
  }, [
    assessmentData,
    assessmentTemplateData,
    assessmentTemplate,
    builderState.formMode,
    builderState.entityMode,
    isEditing,
  ]);

  const handleTestChange = (
    principleID: string,
    criterionID: string,
    newTest: AssessmentTest,
  ) => {
    // update criterion change
    const mandatory: (number | null)[] = [];
    const optional: (number | null)[] = [];

    if (currentAssessmentInfo) {
      const newPrinciples = currentAssessmentInfo?.principles.map(
        (principle) => {
          if (principle.id === principleID) {
            const newCriteria = principle.criteria.map((criterion) => {
              let resultCriterion: AssessmentCriterion;
              if (criterion.id === criterionID) {
                const newTests = criterion.metric.tests.map((test) => {
                  if (test.id === newTest.id) {
                    return newTest;
                  }
                  return test;
                });
                let newMetric = { ...criterion.metric, tests: newTests };
                const { result, value } = evalMetric(newMetric);
                newMetric = { ...newMetric, result: result, value: value };
                // create a new criterion object with updates due to changes
                resultCriterion = { ...criterion, metric: newMetric };
              } else {
                // use the old object with no changes
                resultCriterion = criterion;
              }

              return resultCriterion;
            });

            return { ...principle, criteria: newCriteria };
          }
          return principle;
        },
      );

      let compliance: boolean | null;

      const newAssessment = {
        ...currentAssessmentInfo,
        principles: newPrinciples,
      };
      // update criteria result reference tables

      newAssessment.principles.forEach((principle) => {
        principle.criteria.forEach((criterion) => {
          if (
            criterion.imperative === AssessmentCriterionImperative.Must ||
            criterion.imperative === AssessmentCriterionImperative.MUST
          ) {
            mandatory.push(criterion.metric.result);
          } else {
            optional.push(criterion.metric.result);
          }
        });
      });

      if (mandatory.some((result) => result === null)) {
        compliance = null;
      } else {
        compliance = mandatory.every((result) => result === 1);
      }

      // get how many optional items have passed
      const optionalPass: number = optional.reduce(
        (sum: number, current: number | null) => {
          if (current && current > 0) {
            return sum + 1;
          }
          return sum;
        },
        0,
      );

      // if there any optional items available, ranking is equal to the percentage of optional passed / total optional
      // else ranking is 0
      const ranking =
        optional.length > 0 ? (optionalPass / optional.length) * 100 : 0;

      setCurrentAssessmentInfo({
        ...newAssessment,
        result: { compliance: compliance, ranking: ranking },
      });
    }
  };

  useEffect(() => {
    window.scrollTo(0, 70);
  }, []);

  useEffect(() => {
    if (assessmentData) {
      const untaggedCriteria = assessment.find(
        (principle) => principle.id === "untagged",
      );

      if (untaggedCriteria?.criteria && untaggedCriteria.criteria.length > 0) {
        const criteriaNotUsedInCurrentMotivation =
          untaggedCriteria?.criteria?.filter(
            (untaggedCriterion) =>
              !assessmentData.principles?.some((principle) =>
                principle.criteria?.some(
                  (criterion) =>
                    criterion.id?.toLowerCase() ===
                    untaggedCriterion.id?.toLowerCase(),
                ),
              ),
          ) || [];

        if (criteriaNotUsedInCurrentMotivation?.length > 0) {
          const missingCriteria = {
            id: "untagged",
            name: "",
            description: "",
            criteria: criteriaNotUsedInCurrentMotivation,
          };
          setAssessment([
            ...(assessmentData.principles || []),
            missingCriteria,
          ]);
        } else {
          setAssessment(assessmentData.principles || []);
        }
      } else {
        setAssessment(assessmentData.principles || []);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assessmentData]);

  const motivationCriteriaMutation = useGetMotivationCriteriaMutation(
    keycloak?.token || "",
  );

  const {
    data: metricData,
    fetchNextPage: mtrFetchNextPage,
    hasNextPage: mtrHasNextPage,
  } = useGetAllMotivationMetrics(mtvId || "", {
    size: 20,
    token: keycloak?.token || "",
    isRegistered: registered,
  });

  useEffect(() => {
    let result: RegistryMetric[] = [];

    // iterate over backend pages and gather all items in the motivation metrics array
    if (metricData?.pages) {
      metricData.pages.forEach((page) => {
        const contentDetails = page.content as RegistryMetric[];
        result = [...result, ...contentDetails];
      });

      if (mtrHasNextPage) {
        mtrFetchNextPage();
      }
    }

    setMotivationMetrics(result);
  }, [metricData, mtrHasNextPage, mtrFetchNextPage]);

  useEffect(
    () => () => {
      queryClient.removeQueries({
        queryKey: ["assessment-type-template", mtvId, actId],
      });
      setAssessment([]);
      setAssessmentInfo(undefined);
      setMotivationMetrics([]);
      setBuilderState({
        formMode: "none",
        entityMode: "none",
        selectedId: "",
        selectedPrincipleIndex: -1,
        selectedCriterionIndex: -1,
      });
      setIsPrincipleSelected(false);
      setIsTestSelected(false);
    },
    [mtvId, actId, queryClient],
  );

  const handleAddCriterion = () => {
    setBuilderState({
      formMode: "new",
      entityMode: "criterion",
      selectedId: "",
      selectedPrincipleIndex: -1,
      selectedCriterionIndex: -1,
    });
  };

  const getMetricId = useCallback(() => {
    return (
      assessment
        ?.flatMap((principle) => principle.criteria || [])
        ?.find(
          (criterion) =>
            criterion?.id?.toLowerCase() ===
            builderState.selectedId?.toLowerCase(),
        )?.metric?.db_id || ""
    );
  }, [assessment, builderState.selectedId]);

  const handleUnsavedChangesUpdate = useCallback((hasChanges: boolean) => {
    setHasUnsavedChanges(hasChanges);
  }, []);

  if (isLoading) {
    return (
      <Container fluid className="py-4">
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-2">Loading Assessment Builder...</p>
        </div>
      </Container>
    );
  }

  const evalResult = evalAssessment(currentAssessmentInfo);

  return (
    <>
      <div className={`${styles["assessment-builder"]} mb-3`}>
        <div className={styles["assessment-builder-header"]}>
          <div className={styles["header-content"]}>
            {showTitle && !assessmentTemplate && (
              <div className="d-flex flex-column">
                <h1 className={styles["builder-title"]}>
                  {isEditing ? "Assessment Builder" : "Preview Assessment"}
                </h1>
                {assessmentData && (
                  <p className="lead m-0">
                    {t("page_preview.motivation")}:{" "}
                    <strong>{assessmentData?.assessment_type.name}</strong>{" "}
                    {t("page_preview.actor")}:{" "}
                    <strong>{assessmentData?.actor.name}</strong>
                  </p>
                )}
              </div>
            )}
            {isEditing && (
              <div className={styles["header-actions"]}>
                <button
                  className={styles["add-principle-btn"]}
                  onClick={() =>
                    window.open(
                      buildRoute(
                        ROUTES.ADMIN.MOTIVATIONS.ASSESSMENT_BUILDER_VIEW,
                        {
                          mtvId: mtvId || "",
                          actId: actId || "",
                        },
                      ),
                      "_blank",
                    )
                  }
                >
                  <FaEye className="mt-1" />
                  Preview
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Assessment Status Header */}
        {!isEditing && evalResult && currentAssessmentInfo?.result && (
          <AssessmentEvalStats
            evalResult={evalResult}
            assessmentResult={currentAssessmentInfo.result}
            onSaveAssessmentChanges={onSaveAssessmentChanges}
            onAssessmentSubmit={onAssessmentSubmit}
            wizardTabActive={wizardTabActive}
            currentAssessmentInfo={currentAssessmentInfo}
          />
        )}

        {/* Main Layout - Three Columns */}
        <div className={styles["builder-layout"]}>
          {/* Left Column - Assessment Structure */}
          <div
            className={`${styles["builder-column"]} ${styles["structure-column"]}`}
          >
            {isEditing && (
              <div className={styles["column-header"]}>
                <h3>Structure</h3>
                <button
                  className={styles["add-principle-btn"]}
                  onClick={handleAddCriterion}
                >
                  + Add Criterion
                </button>
              </div>
            )}
            <div className={styles["column-content"]}>
              <AssessmentBuilderStructure
                mtvId={mtvId || ""}
                actId={actId || ""}
                assessment={
                  isEditing
                    ? assessment
                    : currentAssessmentInfo?.principles || []
                }
                setAssessment={setAssessment}
                setAssessmentInfo={setCurrentAssessmentInfo}
                setBuilderState={setBuilderState}
                selectedId={builderState.selectedId || ""}
                allCriteria={allCriteria}
                hasUnsavedChanges={hasUnsavedChanges}
                isEditing={isEditing}
              />
            </div>
          </div>

          {/* Center Column - Preview */}
          <div
            className={`${styles["builder-column"]} ${isEditing ? styles["preview-column-editing"] : styles["preview-column"]}`}
          >
            {isEditing && (
              <div className={styles["column-header"]}>
                <div>
                  <h3>Preview</h3>
                  <p className={styles["column-description"]}>
                    Preview how users will see this assessment
                  </p>
                </div>
              </div>
            )}
            <AssessmentBuilderPreview
              mtvId={mtvId || ""}
              mtrId={getMetricId()}
              criterionPidGraph={
                allCriteria?.find(
                  (criterion) =>
                    criterion?.cri?.toLowerCase() ===
                    builderState.selectedId?.toLowerCase(),
                )?.id
              }
              assessment={
                isEditing ? assessment : currentAssessmentInfo?.principles || []
              }
              setAssessment={setAssessment}
              builderState={builderState}
              setBuilderState={setBuilderState}
              motivationMetrics={motivationMetrics}
              refetchAssessmentData={refetchAssessmentData}
              isPrincipleSelected={isPrincipleSelected}
              setIsPrincipleSelected={setIsPrincipleSelected}
              isTestSelected={isTestSelected}
              setIsTestSelected={setIsTestSelected}
              canEditMetricAndTests={canEditMetricAndTests({
                currentCriterion: allCriteria.find(
                  (criterion) =>
                    criterion?.cri?.toLowerCase() ===
                    builderState.selectedId?.toLowerCase(),
                ),
                mtvId: mtvId || "",
                actId: actId || "",
              })}
              onUnsavedChangesUpdate={handleUnsavedChangesUpdate}
              isEditing={isEditing}
              onTestChange={handleTestChange}
              onAutoTestGroup={onAutoTestGroup}
              autogroups={currentAssessmentInfo?.automated_group_test || []}
            />
          </div>

          {/* Right Column - Builder */}
          {isEditing && (
            <div
              className={`${styles["builder-column"]} ${styles["editor-column"]}`}
            >
              <div className={styles["column-header"]}>
                <div className={styles["builder-header-content"]}>
                  <h3>
                    Builder
                    {builderState.entityMode !== "none"
                      ? ` (${builderState.entityMode})`
                      : null}
                  </h3>
                  <div className={styles["principle-tabs"]}>
                    <button
                      className={`${styles["tab-btn"]} ${builderState.formMode === "new" ? styles["active"] : ""} ${builderState.formMode === "none" ? styles["disabled"] : ""}`}
                      onClick={() => {
                        setBuilderState((prevState) => ({
                          ...prevState,
                          formMode: "new",
                        }));
                      }}
                      disabled={
                        builderState.formMode === "none" ||
                        builderState.formMode === "edit"
                      }
                    >
                      New
                    </button>
                    <div className={styles["tab-divider"]} />
                    <button
                      className={`${styles["tab-btn"]} ${builderState.formMode === "select" ? styles["active"] : ""} ${builderState.formMode === "none" ? styles["disabled"] : ""}`}
                      onClick={() => {
                        setBuilderState((prevState) => ({
                          ...prevState,
                          formMode: "select",
                        }));
                      }}
                      disabled={
                        builderState.formMode === "none" ||
                        builderState.formMode === "edit"
                      }
                    >
                      Select
                    </button>
                    {(builderState.entityMode === "criterion" ||
                      builderState.entityMode === "test" ||
                      builderState.entityMode === "none") && (
                      <>
                        <div className={styles["tab-divider"]} />
                        <button
                          className={`${styles["tab-btn"]} ${builderState.formMode === "edit" ? styles["active"] : ""} ${builderState.formMode === "select" || builderState.formMode === "new" ? styles["disabled"] : ""}`}
                          onClick={() => {
                            setBuilderState((prevState) => ({
                              ...prevState,
                              formMode: "edit",
                            }));
                          }}
                          disabled={
                            builderState.formMode === "select" ||
                            builderState.formMode === "new" ||
                            builderState.formMode === "none"
                          }
                        >
                          Edit
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className={styles["column-content"]}>
                {builderState.entityMode === "criterion" && (
                  <AssessmentBuilderCriteria
                    mtvId={mtvId || ""}
                    actId={actId || ""}
                    formMode={builderState.formMode}
                    setAssessment={setAssessment}
                    assessment={assessment}
                    allCriteria={allCriteria || []}
                    allPrinciples={allPrinciples}
                    setBuilderState={setBuilderState}
                    criterionId={
                      builderState.selectedId
                        ? assessment
                            ?.flatMap((principle) => principle.criteria || [])
                            .find(
                              (criterion) =>
                                criterion.id === builderState.selectedId,
                            )?.id
                        : ""
                    }
                    motivationCriteriaMutation={motivationCriteriaMutation}
                    refetchAssessmentData={refetchAssessmentData}
                  />
                )}
                {builderState.entityMode === "principle" && (
                  <AssessmentBuilderPrinciples
                    mtvId={mtvId || ""}
                    actId={actId || ""}
                    formMode={builderState.formMode}
                    assessment={assessment}
                    allPrinciples={allPrinciples}
                    allCriteria={allCriteria}
                    principleId={
                      builderState.selectedId
                        ? assessment.find((principle) =>
                            principle.criteria?.some(
                              (criterion) =>
                                criterion.id === builderState.selectedId,
                            ),
                          )?.id || ""
                        : ""
                    }
                    builderState={builderState}
                    refetchPrinciples={refetchPrinciples}
                    refetchAssessmentData={refetchAssessmentData}
                    motivationCriteriaMutation={motivationCriteriaMutation}
                    setIsPrincipleSelected={setIsPrincipleSelected}
                  />
                )}
                {builderState.entityMode === "test" && (
                  <AssessmentBuilderTests
                    assessment={assessment}
                    builderState={builderState}
                    setIsTestSelected={setIsTestSelected}
                    refetchAssessmentData={refetchAssessmentData}
                    mtvId={mtvId || ""}
                    mtrId={getMetricId()}
                    allTests={allTests}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      {!assessmentTemplate && (
        <Button
          className="mt-4 ms-1"
          variant="secondary"
          onClick={() =>
            isEditing
              ? navigate(`/admin/motivations/${mtvId || ""}`)
              : navigate(-1)
          }
        >
          {t("buttons.back")}
        </Button>
      )}
    </>
  );
}

export default AssessmentBuilder;
