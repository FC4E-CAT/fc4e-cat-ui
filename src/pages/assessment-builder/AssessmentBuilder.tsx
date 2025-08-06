import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  useState,
  useContext,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import toast from "react-hot-toast";
import { Button, Container, Spinner } from "react-bootstrap";
import { AuthContext } from "@/auth";
import { useGetAllPrinciples } from "@/api";
import { useGetMotivationAssessmentTypeTemplate } from "@/api/services/motivations";
import {
  usePublishMotivationActor,
  useUnpublishMotivationActor,
  useGetMotivation,
  useGetMotivationCriteriaMutation,
  useGetAllMotivationMetrics,
} from "@/api/services/motivations";
import { useQueryClient } from "@tanstack/react-query";
import {
  Principle,
  AssessmentBuilderState,
  AlertInfo,
  RegistryMetric,
} from "@/types";
import { useGetAllCriteria } from "../../api/services/criteria";
import AssessmentBuilderStructure from "./AssessmentBuilderStructure";
import AssessmentBuilderPreview from "./AssessmentBuilderPreview";
import AssessmentBuilderCriteria from "./AssessmentBuilderCriteria";
import AssessmentBuilderPrinciples from "./AssessmentBuilderPrinciples";
import AssessmentBuilderTests from "./AssessmentBuilderTests";
import styles from "./AssessmentBuilder.module.css";
import { useGetAllTests } from "@/api/services/registry";
import { canEditCriterion } from "./utils";

function AssessmentBuilder() {
  const { mtvId, actId } = useParams<{
    mtvId: string;
    actId: string;
  }>();

  const { keycloak, registered } = useContext(AuthContext)!;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const alert = useRef<AlertInfo>({
    message: "",
  });
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

  const {
    data: assessmentData,
    refetch: refetchAssessmentData,
    isLoading,
  } = useGetMotivationAssessmentTypeTemplate(
    mtvId || "",
    actId || "",
    keycloak?.token || "",
    registered,
  );
  const [assessment, setAssessment] = useState(
    assessmentData?.principles || [],
  );
  const [motivationMetrics, setMotivationMetrics] = useState<RegistryMetric[]>(
    [],
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

  useEffect(() => {
    if (
      assessmentData &&
      builderState.formMode === "none" &&
      builderState.entityMode === "none"
    ) {
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
    }
  }, [assessmentData, builderState.formMode, builderState.entityMode]);

  const { data: motivationData } = useGetMotivation({
    id: mtvId || "",
    token: keycloak?.token || "",
    isRegistered: registered,
  });

  const isPublished =
    motivationData?.actors?.find((actor) => actor.id === actId)?.published ||
    false;

  const mutationPublish = usePublishMotivationActor(keycloak?.token || "");
  const mutationUnpublish = useUnpublishMotivationActor(keycloak?.token || "");

  const handlePublish = () => {
    if (!mtvId || !actId) return;

    const promise = mutationPublish
      .mutateAsync({ mtvId, actId })
      .catch((err) => {
        alert.current = {
          message: t("page_motivations.toast_asmt_publish_fail"),
        };
        throw err;
      })
      .then(() => {
        alert.current = {
          message: t("page_motivations.toast_asmt_publish_success"),
        };
        refetchAssessmentData();
      });

    toast.promise(promise, {
      loading: t("page_motivations.toast_asmt_publish_progress"),
      success: () => `${alert.current.message}`,
      error: () => `${alert.current.message}`,
    });
  };

  const handleUnpublish = () => {
    if (!mtvId || !actId) return;

    const promise = mutationUnpublish
      .mutateAsync({ mtvId, actId })
      .catch((err) => {
        alert.current = {
          message: t("page_motivations.toast_asmt_unpublish_fail"),
        };
        throw err;
      })
      .then(() => {
        alert.current = {
          message: t("page_motivations.toast_asmt_unpublish_success"),
        };
        refetchAssessmentData();
      });

    toast.promise(promise, {
      loading: t("page_motivations.toast_asmt_unpublish_progress"),
      success: () => `${alert.current.message}`,
      error: () => `${alert.current.message}`,
    });
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

  const { data: principlesData, refetch: refetchPrinciples } =
    useGetAllPrinciples({
      token: keycloak?.token || "",
      isRegistered: registered,
      size: 100,
    });

  const allPrinciples: Principle[] =
    principlesData?.pages?.flatMap((page) => page.content) || [];

  const { data: criteriaData } = useGetAllCriteria({
    size: 100,
    token: keycloak?.token || "",
    isRegistered: registered,
  });
  const allCriteria =
    criteriaData?.pages?.flatMap((page) => page.content) || [];

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
      queryClient.removeQueries(["assessment-type-template", mtvId, actId]);
      setAssessment([]);
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

  return (
    <>
      <div className={`${styles["assessment-builder"]} mb-3`}>
        <div className={styles["assessment-builder-header"]}>
          <div className={styles["header-content"]}>
            <div className="d-flex flex-column">
              <h1 className={styles["builder-title"]}>Assessment Builder</h1>
              {assessmentData && (
                <p className="lead m-0">
                  {t("page_preview.motivation")}:{" "}
                  <strong>{assessmentData?.assessment_type.name}</strong>{" "}
                  {t("page_preview.actor")}:{" "}
                  <strong>{assessmentData?.actor.name}</strong>
                </p>
              )}
            </div>
            <div className={styles["header-actions"]}>
              {isPublished ? (
                <button
                  className={styles["btn-outline-primary"]}
                  onClick={handleUnpublish}
                >
                  Unpublish
                </button>
              ) : (
                <button
                  className={styles["btn-primary"]}
                  onClick={handlePublish}
                >
                  Publish
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Layout - Three Columns */}
        <div className={styles["builder-layout"]}>
          {/* Left Column - Assessment Structure */}
          <div
            className={`${styles["builder-column"]} ${styles["structure-column"]}`}
          >
            <div className={styles["column-header"]}>
              <h3>Structure</h3>
              <button
                className={styles["add-principle-btn"]}
                onClick={handleAddCriterion}
              >
                + Add Criterion
              </button>
            </div>
            <div className={styles["column-content"]}>
              <AssessmentBuilderStructure
                mtvId={mtvId || ""}
                actId={actId || ""}
                assessment={assessment}
                setAssessment={setAssessment}
                setBuilderState={setBuilderState}
                selectedId={builderState.selectedId || ""}
                allCriteria={allCriteria}
              />
            </div>
          </div>

          {/* Center Column - Preview */}
          <div
            className={`${styles["builder-column"]} ${styles["preview-column"]}`}
          >
            <div className={styles["column-header"]}>
              <div>
                <h3>Preview</h3>
                <p className={styles["column-description"]}>
                  Preview how users will see this assessment
                </p>
              </div>
            </div>
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
              assessment={assessment}
              setAssessment={setAssessment}
              builderState={builderState}
              setBuilderState={setBuilderState}
              motivationMetrics={motivationMetrics}
              refetchAssessmentData={refetchAssessmentData}
              isPrincipleSelected={isPrincipleSelected}
              setIsPrincipleSelected={setIsPrincipleSelected}
              isTestSelected={isTestSelected}
              setIsTestSelected={setIsTestSelected}
              canEditCriterion={canEditCriterion({
                currentCriterion: allCriteria.find(
                  (criterion) =>
                    criterion?.cri?.toLowerCase() ===
                    builderState.selectedId?.toLowerCase(),
                ),
                mtvId: mtvId || "",
                actId: actId || "",
              })}
            />
          </div>

          {/* Right Column - Builder */}
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
        </div>
      </div>
      <Button
        className="mt-4 ms-1"
        variant="secondary"
        onClick={() => {
          navigate(`/admin/motivations/${mtvId || ""}`);
        }}
      >
        {t("buttons.back")}
      </Button>
    </>
  );
}

export default AssessmentBuilder;
