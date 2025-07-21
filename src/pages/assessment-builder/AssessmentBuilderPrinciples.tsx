import {
  useCreateMotivationPrinciple,
  useGetMotivationActorCriteria,
  useUpdateMotivationActorCriteria,
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
import styles from "./AssessmentBuilder.module.css";
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
  actId,
  principleId,
  assessment,
  setAssessment,
  allPrinciples,
  allCriteria,
  formMode,
  builderState,
  refetchPrinciples,
  motivationCriteriaMutation,
}: {
  mtvId?: string;
  actId?: string;
  principleId?: string;
  assessment: AssessmentPrinciple[];
  setAssessment: (assessment: AssessmentPrinciple[]) => void;
  allPrinciples: Principle[];
  allCriteria: Criterion[];
  formMode: FormMode;
  builderState: AssessmentBuilderState;
  refetchPrinciples?: () => void;
  motivationCriteriaMutation: {
    mutateAsync: (data: { mtvId: string }) => Promise<{ content: Criterion[] }>;
  };
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
  const [selectedCriteria, setSelectedCriteria] = useState<Criterion[]>([]);
  const [showErrors, setShowErrors] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const assignCriteriaToActorMutation = useUpdateMotivationActorCriteria(
    keycloak?.token || "",
    mtvId || "",
    actId || "",
  );

  const {
    data: motivationCriteria,
    fetchNextPage: selCriFetchNextPage,
    hasNextPage: selCriHasNextPage,
  } = useGetMotivationActorCriteria(mtvId || "", actId || "", {
    size: 5,
    token: keycloak?.token || "",
    isRegistered: registered,
  });

  useEffect(() => {
    let tmpSelCri: Criterion[] = [];
    if (motivationCriteria?.pages) {
      motivationCriteria.pages.map((page) => {
        tmpSelCri = [...tmpSelCri, ...page.content];
      });
      if (selCriHasNextPage) {
        selCriFetchNextPage();
      }
    }
    setSelectedCriteria(tmpSelCri);
  }, [motivationCriteria, selCriHasNextPage, selCriFetchNextPage]);

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

  const handleValidate = () => {
    setShowErrors(true);
    return (
      principleForm?.pri !== "" &&
      principleForm?.label !== "" &&
      principleForm?.description !== ""
    );
  };

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

  const createPrincipleToMotivation = () => {
    const promise = mutateCreateMotivationPrinciple
      .mutateAsync()
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
      })
      .catch((err) => {
        alert.current = {
          message: "Error: " + (err.response?.data?.message || err.message),
        };
        throw err;
      });

    toast.promise(promise, {
      loading: "Adding principle to motivation...",
      success: () => alert.current.message,
      error: () => alert.current.message,
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
      const allMotivationCriteriaData =
        await motivationCriteriaMutation.mutateAsync({
          mtvId: mtvId || "",
        });

      const allMotivationCriteria = allMotivationCriteriaData?.content || [];

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

          if (!principleId || principleId === "untagged") {
            const criImp = selectedCriteria?.map((item) => ({
              criterion_id: item.id,
              imperative_id: item.imperative.id,
            }));

            const imperative_id = allCriteria?.find(
              (criterion) => criterion?.id === selectedCriterionPidGraph,
            )?.imperative;

            criImp.push({
              criterion_id: selectedCriterionPidGraph || "",
              imperative_id:
                typeof imperative_id === "string"
                  ? imperative_id
                  : imperative_id?.id || "",
            });

            try {
              assignCriteriaToActorMutation.mutateAsync(criImp);
            } catch (error) {
              console.error("Assign criteria to actor failed:", error);
              throw error;
            }
          }

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

    setSelectedRegistryPrincipleId(null);
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
        <div className={styles["principles-list-container"]}>
          <div className={styles["principles-list"]}>
            <div className={styles["principles-list-actions"]}>
              <button
                className={styles["select-principle-btn"]}
                onClick={handleSubmit}
                disabled={
                  !selectedRegistryPrincipleId ||
                  selectedPrinciplePidGraph === selectedRegistryPrincipleId
                }
              >
                Select Principle
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

            {filteredPrinciples.length === 0 ? (
              <p className={styles["no-principles"]}>
                {searchTerm
                  ? "No principles found matching your search"
                  : allPrinciples.length === 0
                    ? "No principles available"
                    : "All available principles have been added"}
              </p>
            ) : (
              <div className={styles["principles-grid"]}>
                {filteredPrinciples?.map((principle) => (
                  <div
                    key={principle.id}
                    className={`${styles["principle-card"]} ${selectedRegistryPrincipleId === principle.id ? styles["selected"] : ""}`}
                    onClick={() => setSelectedRegistryPrincipleId(principle.id)}
                  >
                    <div className={styles["principle-card-compact-header"]}>
                      <FaTags className={styles["principle-card-icon"]} />
                      <span className={styles["principle-card-compact-title"]}>
                        <span className={styles["principle-card-pri"]}>
                          {principle.pri}
                        </span>{" "}
                        - {principle.label}
                      </span>
                    </div>
                    <p className={styles["principle-card-description"]}>
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
          <div className={styles["principle-form"]}>
            <h4>Add New Principle</h4>
            <div className={styles["form-group"]}>
              <label htmlFor="principle-pri">Pri (*):</label>
              <input
                id="principle-pri"
                type="text"
                className={styles["form-control"]}
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

            <div className={styles["form-group"]}>
              <label htmlFor="principle-label">Label (*):</label>
              <input
                id="principle-label"
                type="text"
                className={styles["form-control"]}
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

            <div className={styles["form-group"]}>
              <label htmlFor="principle-description">Description (*):</label>
              <textarea
                id="principle-description"
                className={styles["form-control"]}
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

            <div className={styles["form-actions"]}>
              <button className={styles["btn-primary"]} onClick={handleSubmit}>
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
