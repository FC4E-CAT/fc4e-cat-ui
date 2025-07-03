import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState, useContext, useEffect, useRef } from "react";
import { FaInfoCircle } from "react-icons/fa";
import { OverlayTrigger, Tooltip, Button } from "react-bootstrap";
import { AuthContext } from "@/auth";
import { useGetAllPrinciples } from "@/api";
import { useGetMotivationAssessmentType } from "@/api/services/templates";
import {
  usePublishMotivationActor,
  useUnpublishMotivationActor,
  useGetMotivation,
} from "@/api/services/motivations";
import {
  Principle,
  AssessmentBuilderState,
  AssessmentCriterionImperative,
  AlertInfo,
} from "@/types";
import AssessmentBuilderPrinciples from "./AssessmentBuilderPrinciples";
import "./AssessmentBuilder.css";
import AssessmentBuilderStructure from "./AssessmentBuilderStructure";
import AssessmentBuilderCriteria from "./AssessmentBuilderCriteria";
import { useGetAllCriteria } from "../../api/services/criteria";
import toast from "react-hot-toast";

function AssessmentBuilder() {
  const { mtvId, actId } = useParams<{
    mtvId: string;
    actId?: string;
  }>();

  const { t } = useTranslation();
  const { keycloak, registered } = useContext(AuthContext)!;
  const navigate = useNavigate();

  const alert = useRef<AlertInfo>({
    message: "",
  });

  const { data: assessmentData, refetch: refetchAssessmentData } =
    useGetMotivationAssessmentType(
      mtvId || "",
      actId || "",
      keycloak?.token || "",
      registered,
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

  const [assessment, setAssessment] = useState(
    assessmentData?.principles || [],
  );
  const [builderState, setBuilderState] = useState<AssessmentBuilderState>({
    formMode: "none",
    entityMode: "none",
    selectedId: "",
    selectedPrincipleIndex: -1,
    selectedCriterionIndex: -1,
  });

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

  const handleAddCriterion = () => {
    setBuilderState((prevState) => ({
      ...prevState,
      formMode: "select",
      entityMode: "criterion",
      selectedId: "",
      selectedPrincipleIndex: -1,
      selectedCriterionIndex: -1,
    }));
  };

  return (
    <>
      <div className="assessment-builder mb-3">
        <div className="assessment-builder-header">
          <div className="header-content">
            <h1 className="builder-title">Assessment Builder</h1>
            <div className="header-actions">
              <button className="btn-secondary">Preview</button>
              {isPublished ? (
                <button
                  className="btn-outline-primary"
                  onClick={handleUnpublish}
                >
                  Unpublish
                </button>
              ) : (
                <button className="btn-primary" onClick={handlePublish}>
                  Publish
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Layout - Three Columns */}
        <div className="builder-layout">
          {/* Left Column - Assessment Structure */}
          <div className="builder-column structure-column">
            <div className="column-header">
              <h3>Structure</h3>
              <button
                className="add-principle-btn"
                onClick={handleAddCriterion}
              >
                + Add Criterion
              </button>
            </div>
            <div className="column-content">
              <AssessmentBuilderStructure
                assessment={assessment}
                setBuilderState={setBuilderState}
                selectedId={builderState.selectedId || ""}
              />
            </div>
          </div>

          {/* Center Column - Preview */}
          <div className="builder-column preview-column">
            <div className="column-header">
              <div>
                <h3>Preview</h3>
                <p className="column-description">
                  Preview how users will see this assessment
                </p>
              </div>
            </div>
            <div className="column-content">
              {assessment?.length > 0 ? (
                <div className="builder-preview">
                  {builderState.selectedPrincipleIndex != null &&
                  builderState.selectedPrincipleIndex > -1 ? (
                    <div
                      className="principle-wrapper"
                      onClick={() =>
                        setBuilderState((prevState) => ({
                          ...prevState,
                          entityMode: "principle",
                          formMode: "select",
                        }))
                      }
                    >
                      <span className="h5 align-middle">
                        Part of Principle{" "}
                        {assessment[builderState.selectedPrincipleIndex]?.id}:{" "}
                        {assessment[builderState.selectedPrincipleIndex]?.name}
                      </span>
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
                              assessment[builderState.selectedPrincipleIndex]
                                ?.description
                            }
                          </Tooltip>
                        }
                      >
                        <span className="ms-2 mb-2">
                          <FaInfoCircle className="text-secondary opacity-50 align-middle" />
                        </span>
                      </OverlayTrigger>
                    </div>
                  ) : builderState.selectedCriterionIndex == null ||
                    builderState.selectedCriterionIndex < 0 ? (
                    <div className="empty-preview">
                      <p className="text-muted">
                        Please select a criterion from the structure list to see
                        its details here.
                      </p>
                    </div>
                  ) : null}

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
                            ?.criteria[builderState.selectedCriterionIndex]
                            ?.name
                        }
                      </span>

                      {assessment[builderState.selectedPrincipleIndex || 0]
                        ?.criteria[builderState.selectedCriterionIndex]
                        ?.imperative === AssessmentCriterionImperative.MUST ? (
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
                            ?.criteria[builderState.selectedCriterionIndex]
                            ?.description
                        }
                      </p>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="empty-preview">
                  <p className="text-muted">
                    No assessment structure defined yet. Please add or select a
                    criterion to start building your assessment.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Builder */}
          <div className="builder-column editor-column">
            <div className="column-header">
              <div className="builder-header-content">
                <h3>Builder</h3>
                <div className="principle-tabs">
                  <button
                    className={`tab-btn ${builderState.formMode === "select" ? "active" : ""} ${builderState.formMode === "none" ? "disabled" : ""}`}
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
                  <div className="tab-divider" />
                  <button
                    className={`tab-btn ${builderState.formMode === "new" ? "active" : ""} ${builderState.formMode === "none" ? "disabled" : ""}`}
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
                  {(builderState.entityMode === "criterion" ||
                    builderState.entityMode === "none") && (
                    <>
                      <div className="tab-divider" />
                      <button
                        className={`tab-btn ${builderState.formMode === "edit" ? "active" : ""} ${builderState.formMode === "select" || builderState.formMode === "new" ? "disabled" : ""}`}
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
            <div className="column-content">
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
                  setBuilderState={setBuilderState}
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
                  setBuilderState={setBuilderState}
                  refetchPrinciples={refetchPrinciples}
                />
              )}
            </div>
          </div>
        </div>
      </div>
      <Button
        className="mt-5 ms-1"
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
