import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState, useContext, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { Button } from "react-bootstrap";
import { AuthContext } from "@/auth";
import { useGetAllPrinciples } from "@/api";
import { useGetMotivationAssessmentType } from "@/api/services/templates";
import {
  usePublishMotivationActor,
  useUnpublishMotivationActor,
  useGetMotivation,
  useGetMotivationCriteriaMutation,
} from "@/api/services/motivations";
import { Principle, AssessmentBuilderState, AlertInfo } from "@/types";
import { useGetAllCriteria } from "../../api/services/criteria";
import AssessmentBuilderStructure from "./AssessmentBuilderStructure";
import AssessmentBuilderPreview from "./AssessmentBuilderPreview";
import AssessmentBuilderCriteria from "./AssessmentBuilderCriteria";
import AssessmentBuilderPrinciples from "./AssessmentBuilderPrinciples";
import styles from "./AssessmentBuilder.module.css";

function AssessmentBuilder() {
  const { mtvId, actId } = useParams<{
    mtvId: string;
    actId?: string;
  }>();

  const { keycloak, registered } = useContext(AuthContext)!;
  const navigate = useNavigate();

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

  const { data: assessmentData, refetch: refetchAssessmentData } =
    useGetMotivationAssessmentType(
      mtvId || "",
      actId || "",
      keycloak?.token || "",
      registered,
    );
  const [assessment, setAssessment] = useState(
    assessmentData?.principles || [],
  );

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
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (assessmentData) {
      setAssessment(assessmentData?.principles || []);
    }
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

  const handleAddCriterion = () => {
    setBuilderState((prevState) => ({
      ...prevState,
      formMode: "new",
      entityMode: "criterion",
      selectedId: "",
      selectedPrincipleIndex: -1,
      selectedCriterionIndex: -1,
    }));
  };

  console.log("builderState:", builderState);

  return (
    <>
      <div className={`${styles["assessment-builder"]} mb-3`}>
        <div className={styles["assessment-builder-header"]}>
          <div className={styles["header-content"]}>
            <h1 className={styles["builder-title"]}>Assessment Builder</h1>
            <div className={styles["header-actions"]}>
              <button className={styles["btn-secondary"]}>Preview</button>
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
                assessment={assessment}
                setAssessment={setAssessment}
                setBuilderState={setBuilderState}
                selectedId={builderState.selectedId || ""}
                motivationCriteriaMutation={motivationCriteriaMutation}
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
              assessment={assessment}
              builderState={builderState}
              setBuilderState={setBuilderState}
            />
          </div>

          {/* Right Column - Builder */}
          <div
            className={`${styles["builder-column"]} ${styles["editor-column"]}`}
          >
            <div className={styles["column-header"]}>
              <div className={styles["builder-header-content"]}>
                <h3>Builder</h3>
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
                />
              )}
              {builderState.entityMode === "principle" && (
                <AssessmentBuilderPrinciples
                  mtvId={mtvId || ""}
                  formMode={builderState.formMode}
                  setAssessment={setAssessment}
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
                  motivationCriteriaMutation={motivationCriteriaMutation}
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
