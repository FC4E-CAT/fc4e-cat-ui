import {
  useCreateMotivationPrinciple,
  useGetMotivationCriteriaMutation,
  useUpdateMotivationPrinciplesCriteria,
} from "@/api";
import {
  AlertInfo,
  AssessmentBuilderState,
  AssessmentPrinciple,
  Criterion,
  FormMode,
  Principle,
  PrincipleInput,
} from "@/types";
import { useContext, useEffect, useRef, useState } from "react";
import { FaTags } from "react-icons/fa";
import { AuthContext } from "@/auth";
import toast from "react-hot-toast";
import "./AssessmentBuilder.css";
import { useTranslation } from "react-i18next";
import {
  assessmentPrincipleToForm,
  formatDataToAssignPrincipleToCriterion,
  handleEditCriterion,
} from "./utils";
import { relMtvPrincpleCriterion } from "@/config";

const getPrincipleFromAssessment = (
  principleId: string,
  assessment: AssessmentPrinciple[],
): PrincipleInput | null => {
  return assessmentPrincipleToForm(principleId, assessment);
};

function AssessmentBuilderPrinciples({
  mtvId,
  principleId,
  assessment,
  setAssessment,
  allPrinciples,
  allCriteria,
  formMode,
  builderState,
  setBuilderState,
  refetchPrinciples,
}: {
  mtvId?: string;
  principleId?: string;
  assessment: AssessmentPrinciple[];
  setAssessment: (assessment: AssessmentPrinciple[]) => void;
  allPrinciples: Principle[];
  allCriteria: Criterion[];
  formMode: FormMode;
  builderState: AssessmentBuilderState;
  setBuilderState: (builderState: AssessmentBuilderState) => void;
  refetchPrinciples?: () => void;
}) {
  const { keycloak, registered } = useContext(AuthContext)!;
  const alert = useRef<AlertInfo>({
    message: "",
  });

  const [principleForm, setPrincipleForm] = useState<PrincipleInput>(
    getPrincipleFromAssessment(principleId || "", assessment) || {
      pri: "",
      label: "",
      description: "",
    },
  );

  const [showErrors, setShowErrors] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (formMode !== "edit") {
      setPrincipleForm({
        pri: "",
        label: "",
        description: "",
      });
      setSelectedRegistryPrincipleId(null);
    }
  }, [formMode, principleId, assessment, builderState.selectedId]);

  function handleValidate() {
    setShowErrors(true);
    return (
      principleForm?.pri !== "" &&
      principleForm?.label !== "" &&
      principleForm?.description !== ""
    );
  }

  const filteredPrinciples = allPrinciples.filter((principle) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      principle.pri?.toLowerCase().includes(term) ||
      principle.label?.toLowerCase().includes(term) ||
      principle.description?.toLowerCase().includes(term)
    );
  });

  const { t } = useTranslation();

  const selectedPrinciplePidGraph = allPrinciples?.find(
    (principle) => principle?.pri?.toLowerCase() === principleId?.toLowerCase(),
  )?.id;

  const selectedCriterionPidGraph = allCriteria?.find(
    (criterion) =>
      criterion?.cri?.toLowerCase() === builderState?.selectedId?.toLowerCase(),
  )?.id;

  const [selectedRegistryPrincipleId, setSelectedRegistryPrincipleId] =
    useState<string | null>(selectedPrinciplePidGraph || null);

  const mutateCreateMotivationPrinciple = useCreateMotivationPrinciple(
    keycloak?.token || "",
    mtvId || "",
    principleForm || { pri: "", label: "", description: "" },
  );

  const assignPrincipleToCriterion = useUpdateMotivationPrinciplesCriteria(
    keycloak?.token || "",
    mtvId || "",
  );

  const getMotivationCriteriaMutation = useGetMotivationCriteriaMutation(
    keycloak?.token || "",
  );

  const createPrincipleToMotivation = () => {
    const promise = mutateCreateMotivationPrinciple
      .mutateAsync()
      .catch((err) => {
        alert.current = {
          message: "Error: " + (err.response?.data?.message || err.message),
        };
        throw err;
      })
      .then(() => {
        alert.current = {
          message: "Principle added to motivation successfully",
        };
        setShowErrors(false);
        setPrincipleForm({
          pri: "",
          label: "",
          description: "",
        });
        if (refetchPrinciples) {
          refetchPrinciples();
        }
      });

    toast.promise(promise, {
      loading: "Adding principle to motivation...",
      success: () => `${alert.current.message}`,
      error: () => `${alert.current.message}`,
    });
  };

  const handleSubmit = async () => {
    if (!registered) {
      alert.current = {
        message: "You must be registered to perform this action.",
      };
      toast.error(alert.current.message);
      return;
    }

    if ((formMode === "new" || formMode === "edit") && !handleValidate()) {
      return;
    }

    if (formMode === "new") {
      if (
        principleForm?.pri &&
        principleForm.label &&
        principleForm.description
      ) {
        createPrincipleToMotivation();
      }
    } else if (formMode === "select") {
      const allMotivationCriteriaContent =
        await getMotivationCriteriaMutation.mutateAsync({
          mtvId: mtvId || "",
        });

      const allMotivationCriteria = allMotivationCriteriaContent?.content || [];

      const formattedPriCri = formatDataToAssignPrincipleToCriterion({
        principleId: selectedRegistryPrincipleId || "",
        criterionId: selectedCriterionPidGraph || "",
        allMotivationCriteria: allMotivationCriteria,
      }) || [
        {
          principleId: "",
          criterionId: "",
          relation: relMtvPrincpleCriterion,
          annotation_text: "",
          annotation_url: "",
        },
      ];

      const promise = assignPrincipleToCriterion
        .mutateAsync(formattedPriCri)
        .catch((err) => {
          alert.current = {
            message: t("page_motivations.toast_manage_cri_fail"),
          };
          throw err;
        })
        .then(() => {
          alert.current = {
            message: t("page_motivations.toast_manage_cri_success"),
          };

          const selectedCriterion = allCriteria?.find(
            (criterion) =>
              criterion?.cri?.toLowerCase() ===
              builderState?.selectedId?.toLowerCase(),
          );

          const updatedAssessment = handleEditCriterion(
            builderState?.selectedId || "",
            {
              cri: selectedCriterion?.cri || "",
              label: selectedCriterion?.label || "",
              description: selectedCriterion?.description || "",
              imperative: String(selectedCriterion?.imperative || ""),
            },
            selectedRegistryPrincipleId,
            allPrinciples,
            assessment,
          );

          if (updatedAssessment.length > 0) {
            setAssessment(updatedAssessment);
          }
        });

      toast.promise(promise, {
        loading: t("page_motivations.toast_manage_cri_progress"),
        success: () => `${alert.current.message}`,
        error: () => `${alert.current.message}`,
      });
    }
    // else if (formMode === "edit") {
    //   if (
    //     principleForm?.pri &&
    //     principleForm?.label &&
    //     principleForm?.description
    //   ) {
    //   }
    // }
  };

  const handleCancel = () => {
    setPrincipleForm({ pri: "", label: "", description: "" });
    setBuilderState({
      formMode: "none",
      entityMode: "none",
      selectedId: "",
      selectedPrincipleIndex: -1,
      selectedCriterionIndex: -1,
    });
  };

  const handlePrincipleInputChange = (
    field: keyof PrincipleInput,
    value: string,
  ) => {
    if (!principleForm) return;
    setPrincipleForm((principleForm) => ({
      ...principleForm,
      [field]: value,
    }));
  };

  return (
    <>
      {formMode === "select" ? (
        <div className="principles-list-container">
          <div className="principles-list">
            <div className="principles-list-actions">
              <button
                className="select-principle-btn"
                onClick={handleSubmit}
                disabled={
                  !selectedRegistryPrincipleId ||
                  selectedPrinciplePidGraph === selectedRegistryPrincipleId
                }
              >
                Select Principle
              </button>
            </div>

            <div className="form-group">
              <input
                type="text"
                className="form-control mb-1"
                style={{ width: "98%", margin: "0 auto" }}
                placeholder="Search principles by ID, label or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {filteredPrinciples.length === 0 ? (
              <p className="no-principles">
                {searchTerm
                  ? "No principles found matching your search"
                  : allPrinciples.length === 0
                    ? "No principles available"
                    : "All available principles have been added"}
              </p>
            ) : (
              <div className="principles-grid">
                {filteredPrinciples?.map((principle) => (
                  <div
                    key={principle.id}
                    className={`principle-card ${selectedRegistryPrincipleId === principle.id ? "selected" : ""}`}
                    onClick={() => setSelectedRegistryPrincipleId(principle.id)}
                  >
                    <div className="principle-card-compact-header">
                      <FaTags className="principle-card-icon" />
                      <span className="principle-card-compact-title">
                        <span className="principle-card-pri">
                          {principle.pri}
                        </span>{" "}
                        - {principle.label}
                      </span>
                    </div>
                    <p className="principle-card-description">
                      {principle.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        formMode === "new" && (
          <div className="principle-form">
            <h4>Add New Principle</h4>
            <div className="form-group">
              <label htmlFor="principle-pri">Pri (*):</label>
              <input
                id="principle-pri"
                type="text"
                className="form-control"
                value={principleForm?.pri}
                onChange={(e) =>
                  handlePrincipleInputChange("pri", e.target.value)
                }
                placeholder="Enter principle identifier"
              />
              {showErrors && !principleForm?.pri && (
                <span className="text-danger">{t("required")}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="principle-label">Label (*):</label>
              <input
                id="principle-label"
                type="text"
                className="form-control"
                value={principleForm?.label}
                onChange={(e) =>
                  handlePrincipleInputChange("label", e.target.value)
                }
                placeholder="Enter principle label"
              />
              {showErrors && !principleForm?.label && (
                <span className="text-danger">{t("required")}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="principle-description">Description (*):</label>
              <textarea
                id="principle-description"
                className="form-control"
                rows={3}
                value={principleForm?.description}
                onChange={(e) =>
                  handlePrincipleInputChange("description", e.target.value)
                }
                placeholder="Enter principle description"
              />
              {showErrors && !principleForm?.description && (
                <span className="text-danger">{t("required")}</span>
              )}
            </div>

            <div className="form-actions">
              <button className="btn-secondary" onClick={handleCancel}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleSubmit}>
                Create Principle
              </button>
            </div>
          </div>
        )
      )}
    </>
  );
}

export default AssessmentBuilderPrinciples;
