import {
  useCreateCriterion,
  useUpdateMotivationPrinciplesCriteria,
  useGetAllImperatives,
  useGetMotivationActorCriteria,
  useUpdateCriterion,
  useUpdateMotivationActorCriteria,
  useGetMotivationCriteriaMutation,
} from "@/api";
import { AuthContext } from "@/auth";
import {
  AlertInfo,
  AssessmentBuilderState,
  AssessmentPrinciple,
  Criterion,
  CriterionInput,
  Imperative,
  PrincipleInput,
} from "@/types";
import { useContext, useEffect, useRef, useState } from "react";
import { Form } from "react-bootstrap";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { FaTags } from "react-icons/fa";
import {
  assessmentCriterionToForm,
  handleSelectCriterion,
  handleNewCriterion,
  formatDataToAssignPrincipleToCriterion,
  handleEditCriterion,
} from "./utils";

function AssessmentBuilderCriteria({
  assessment,
  setAssessment,
  formMode,
  mtvId,
  actId,
  allCriteria,
  allPrinciples,
  setBuilderState,
  criterionId,
}: {
  assessment: AssessmentPrinciple[];
  setAssessment: React.Dispatch<React.SetStateAction<AssessmentPrinciple[]>>;
  formMode: "none" | "select" | "new" | "edit";
  mtvId?: string;
  actId?: string;
  allCriteria: Criterion[];
  allPrinciples?: (PrincipleInput & { id: string })[];
  setBuilderState: (builderState: AssessmentBuilderState) => void;
  criterionId?: string;
}) {
  const { keycloak, registered } = useContext(AuthContext)!;
  const alert = useRef<AlertInfo>({
    message: "",
  });
  const { t } = useTranslation();

  const [selectedCriteria, setSelectedCriteria] = useState<Criterion[]>([]);
  const [principleTag, setPrincipleTag] = useState<string | null>(null);

  const [criterionForm, setCriterionForm] = useState<CriterionInput | null>(
    assessmentCriterionToForm(criterionId || "", assessment, formMode),
  );

  const [showErrors, setShowErrors] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  function handleValidate() {
    setShowErrors(true);
    return (
      criterionForm?.cri !== "" &&
      criterionForm?.label !== "" &&
      criterionForm?.description !== "" &&
      criterionForm?.imperative !== ""
    );
  }

  const filteredCriteria = allCriteria.filter((criterion) => {
    // Check if criterion exists in any principle (including untagged)
    const existsInAssessment = assessment.some((principle) =>
      principle.criteria?.some(
        (assessmentCriterion) =>
          assessmentCriterion.id?.toLowerCase() ===
          criterion.cri?.toLowerCase(),
      ),
    );

    if (!searchTerm) {
      return !existsInAssessment;
    }

    const term = searchTerm.toLowerCase();
    const matchesSearch =
      criterion.cri?.toLowerCase().includes(term) ||
      criterion.label?.toLowerCase().includes(term) ||
      criterion.description?.toLowerCase().includes(term);

    // For search results, also filter out existing criteria
    return matchesSearch && !existsInAssessment;
  });

  const mutateCreateNewCriterion = useCreateCriterion(keycloak?.token || "", {
    cri: criterionForm?.cri || "",
    label: criterionForm?.label || "",
    description: criterionForm?.description || "",
    imperative: criterionForm?.imperative || "",
    type_criterion_id: "pid_graph:4A47BB1A",
  });

  const selectedCriterionPidGraph = allCriteria?.find(
    (criterion) => criterion?.cri?.toLowerCase() === criterionId?.toLowerCase(),
  )?.id;

  const selectedPrincipleLabel = assessment.find((item) =>
    item.criteria.some(
      (c) => c.id?.toLowerCase() === criterionId?.toLowerCase(),
    ),
  )?.id;

  const selectedPrinciplePidGraph = allPrinciples?.find(
    (principle) =>
      principle?.pri?.toLowerCase() === selectedPrincipleLabel?.toLowerCase(),
  )?.id;

  const mutateUpdateCriterion = useUpdateCriterion(
    keycloak?.token || "",
    selectedCriterionPidGraph || "",
    {
      cri: criterionForm?.cri || "",
      label: criterionForm?.label || "",
      description: criterionForm?.description || "",
      imperative: criterionForm?.imperative || "",
    },
  );

  const getMotivationCriteriaMutation = useGetMotivationCriteriaMutation(
    keycloak?.token || "",
  );

  const assignPrincipleToCriterion = useUpdateMotivationPrinciplesCriteria(
    keycloak?.token || "",
    mtvId || "",
  );

  const assignCriteriaToActorMutation = useUpdateMotivationActorCriteria(
    keycloak?.token || "",
    mtvId || "",
    actId || "",
  );

  const [imperatives, setImperatives] = useState<Imperative[]>([]);

  const [selectedRegistryCriterionId, setSelectedRegistryCriterionId] =
    useState<string | null>(criterionId || null);

  const {
    data: impData,
    fetchNextPage: impFetchNextPage,
    hasNextPage: impHasNextPage,
  } = useGetAllImperatives({
    size: 20,
    token: keycloak?.token || "",
    isRegistered: registered,
    search: "",
  });

  const {
    data: selCriData,
    fetchNextPage: selCriFetchNextPage,
    hasNextPage: selCriHasNextPage,
  } = useGetMotivationActorCriteria(mtvId || "", actId || "", {
    size: 5,
    token: keycloak?.token || "",
    isRegistered: registered,
  });

  useEffect(() => {
    let tmpImp: Imperative[] = [];
    if (impData?.pages) {
      impData.pages.map((page) => {
        tmpImp = [...tmpImp, ...page.content];
      });
      if (impHasNextPage) {
        impFetchNextPage();
      }
    }

    setImperatives(tmpImp);
  }, [impData, impHasNextPage, impFetchNextPage]);

  useEffect(() => {
    // gather all motivation actor criteria in one array
    let tmpSelCri: Criterion[] = [];

    // iterate over backend pages and gather all items in the mtv array
    if (selCriData?.pages) {
      selCriData.pages.map((page) => {
        tmpSelCri = [...tmpSelCri, ...page.content];
      });
      if (selCriHasNextPage) {
        selCriFetchNextPage();
      }
    }
    setSelectedCriteria(tmpSelCri);
  }, [selCriData, selCriHasNextPage, selCriFetchNextPage]);

  // Handle edit mode form population
  useEffect(() => {
    // initial form for new or select mode
    if (formMode !== "edit") {
      const formData = assessmentCriterionToForm(
        "",
        assessment,
        formMode,
        setPrincipleTag,
      );

      setCriterionForm(formData);
      return;
    }

    if (formMode === "edit" && criterionId) {
      const formData = assessmentCriterionToForm(
        criterionId,
        assessment,
        formMode,
        setPrincipleTag,
      );

      setCriterionForm(formData);

      if (
        selectedPrinciplePidGraph &&
        selectedPrinciplePidGraph !== "untagged"
      ) {
        setPrincipleTag(selectedPrinciplePidGraph);
      } else {
        setPrincipleTag(null);
      }

      // Find and set the imperative ID from the imperatives list
      if (formData?.imperative && imperatives.length > 0) {
        const matchingImperative = imperatives.find(
          (imp) =>
            imp.label.toLowerCase() === formData.imperative.toLowerCase() ||
            imp.id === formData.imperative,
        );
        if (matchingImperative && formData) {
          setCriterionForm({
            ...formData,
            imperative: matchingImperative.id,
          });
        }
      }
    }
  }, [
    formMode,
    criterionId,
    assessment,
    imperatives,
    selectedCriterionPidGraph,
    selectedPrinciplePidGraph,
  ]);

  const handleCancel = () => {
    setCriterionForm({ cri: "", label: "", description: "", imperative: "" });
    setPrincipleTag("");
    setBuilderState({
      formMode: "none",
      entityMode: "none",
      selectedId: "",
      selectedPrincipleIndex: -1,
      selectedCriterionIndex: -1,
    });
  };

  const handleCriterionInputChange = (
    field: keyof CriterionInput,
    value: string,
  ) => {
    if (!criterionForm) return;
    setCriterionForm({
      ...criterionForm,
      [field]: value,
    });
  };

  const assignCriteriaToActor = async () => {
    const criImp = selectedCriteria?.map((item) => ({
      criterion_id: item.id,
      imperative_id: item.imperative.id,
    }));

    let newCriterionId: string | null = null;
    let formattedPriCri: ReturnType<
      typeof formatDataToAssignPrincipleToCriterion
    > = [];

    const allMotivationCriteriaData =
      await getMotivationCriteriaMutation.mutateAsync({
        mtvId: mtvId || "",
      });

    const allMotivationCriteria = allMotivationCriteriaData?.content || [];

    if (formMode === "new") {
      // First API call - Create new criterion
      try {
        const createResponse = await mutateCreateNewCriterion.mutateAsync();
        // Extract id from response object
        newCriterionId = (createResponse as { id?: string }).id || null;

        if (newCriterionId) {
          criImp.push({
            criterion_id: newCriterionId,
            imperative_id:
              criterionForm?.imperative ||
              (imperatives.length > 0 ? imperatives[0].id : ""),
          });
        }
      } catch (error) {
        console.error("Create criterion failed:", error);
        throw error;
      }

      if (principleTag && newCriterionId) {
        formattedPriCri = formatDataToAssignPrincipleToCriterion({
          principleId: principleTag,
          criterionId: newCriterionId,
          allMotivationCriteria: allMotivationCriteria,
        });

        try {
          await assignPrincipleToCriterion.mutateAsync(formattedPriCri);
        } catch (error) {
          console.error(error);
          throw error;
        }
      }
    }

    if (formMode === "select" && selectedRegistryCriterionId) {
      const selectedCriterionPid = allCriteria.find(
        (criterion) => criterion.cri === selectedRegistryCriterionId,
      )?.id;

      if (principleTag) {
        formattedPriCri = formatDataToAssignPrincipleToCriterion({
          principleId: principleTag || "",
          criterionId: selectedCriterionPid || "",
          allMotivationCriteria: allMotivationCriteria,
        });

        try {
          await assignPrincipleToCriterion.mutateAsync(formattedPriCri);
        } catch (error) {
          console.error("Assign principle to criterion failed:", error);
          throw error;
        }
      }

      criImp.push({
        criterion_id: selectedCriterionPid || "",
        imperative_id:
          criterionForm?.imperative ||
          (imperatives.length > 0 ? imperatives[0].id : ""),
      });
    }

    if (formMode === "edit" && criterionForm?.cri) {
      await mutateUpdateCriterion.mutateAsync();

      if (
        principleTag &&
        principleTag !== "untagged" &&
        principleTag !== selectedPrinciplePidGraph
      ) {
        formattedPriCri = formatDataToAssignPrincipleToCriterion({
          principleId: principleTag || "",
          criterionId: selectedCriterionPidGraph || "",
          allMotivationCriteria: allMotivationCriteria,
        });

        try {
          await assignPrincipleToCriterion.mutateAsync(formattedPriCri);
        } catch (error) {
          console.error("Assign principle to criterion failed:", error);
          throw error;
        }
      }

      if (selectedCriterionPidGraph) {
        criImp.push({
          criterion_id: selectedCriterionPidGraph,
          imperative_id:
            criterionForm?.imperative ||
            (imperatives.length > 0 ? imperatives[0].id : ""),
        });
      }
    }

    if (formMode !== "edit") {
      try {
        await assignCriteriaToActorMutation.mutateAsync(criImp);
      } catch (error) {
        console.error("Assign criteria to actor failed:", error);
        throw error;
      }
    }
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

    const promise = assignCriteriaToActor()
      .catch((err) => {
        alert.current = {
          message: "Error: " + (err.response?.data?.message || err.message),
        };
        throw err;
      })
      .then(() => {
        alert.current = {
          message:
            formMode === "new"
              ? "Criterion created successfully"
              : formMode === "edit"
                ? "Criterion updated successfully"
                : "Criterion selected successfully",
        };

        setAssessment((prevAssessment) => {
          if (formMode === "new") {
            return handleNewCriterion(
              criterionForm || {
                cri: "",
                label: "",
                description: "",
                imperative: "",
              },
              principleTag,
              allPrinciples || [],
              prevAssessment,
              imperatives,
            );
          } else if (formMode === "select" && selectedRegistryCriterionId) {
            return handleSelectCriterion(
              selectedRegistryCriterionId,
              allCriteria,
              principleTag,
              allPrinciples || [],
              prevAssessment,
              imperatives,
            );
          } else if (formMode === "edit" && criterionForm?.cri) {
            return handleEditCriterion(
              criterionId || "",
              criterionForm,
              principleTag,
              allPrinciples || [],
              prevAssessment,
            );
          }
          return prevAssessment;
        });

        if (formMode === "new" || formMode === "edit") {
          setShowErrors(false);
          setCriterionForm({
            cri: "",
            label: "",
            description: "",
            imperative: "",
          });
          setPrincipleTag("");
        }
      });

    toast.promise(promise, {
      loading:
        formMode === "new"
          ? "Creating criterion..."
          : formMode === "edit"
            ? "Updating criterion..."
            : "Selecting criterion...",
      success: () => `${alert.current.message}`,
      error: () => `${alert.current.message}`,
    });
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
                disabled={!selectedRegistryCriterionId}
              >
                Select Criterion
              </button>
            </div>

            <div className="form-group">
              <input
                type="text"
                className="form-control mb-1"
                style={{ width: "98%", margin: "0 auto" }}
                placeholder="Search criteria by ID, label or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {filteredCriteria.length === 0 ? (
              <p className="no-principles">
                {searchTerm
                  ? "No criteria found matching your search"
                  : allCriteria.length === 0
                    ? "No criteria available"
                    : "All available criteria have been added"}
              </p>
            ) : (
              <div className="principles-grid">
                {filteredCriteria?.map((criterion) => (
                  <div
                    key={criterion.cri}
                    className={`principle-card ${selectedRegistryCriterionId === criterion.cri ? "selected" : ""}`}
                    onClick={() =>
                      setSelectedRegistryCriterionId(criterion.cri)
                    }
                  >
                    <div className="principle-card-compact-header">
                      <FaTags className="principle-card-icon" />
                      <span className="principle-card-compact-title">
                        <span className="principle-card-pri">
                          {criterion.cri}
                        </span>{" "}
                        - {criterion.label}
                      </span>
                    </div>
                    <p className="principle-card-description">
                      {criterion.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="principle-form">
          <h4>Add New Criterion</h4>
          <div className="form-group">
            <label htmlFor="principle-pri">Cri (*):</label>
            <input
              id="principle-pri"
              type="text"
              className="form-control"
              value={criterionForm?.cri}
              onChange={(e) =>
                handleCriterionInputChange("cri", e.target.value)
              }
              placeholder="Enter criterion identifier"
              disabled={formMode === "edit"}
            />
            {showErrors && !criterionForm?.cri && (
              <span className="text-danger">{t("required")}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="criterion-label">Label (*):</label>
            <input
              id="criterion-label"
              type="text"
              className="form-control"
              value={criterionForm?.label}
              onChange={(e) =>
                handleCriterionInputChange("label", e.target.value)
              }
              placeholder="Enter criterion label"
            />
            {showErrors && !criterionForm?.label && (
              <span className="text-danger">{t("required")}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="criterion-description">Description (*):</label>
            <textarea
              id="criterion-description"
              className="form-control"
              rows={3}
              value={criterionForm?.description}
              onChange={(e) =>
                handleCriterionInputChange("description", e.target.value)
              }
              placeholder="Enter criterion description"
            />
            {showErrors && !criterionForm?.description && (
              <span className="text-danger">{t("required")}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="new-criterion-description">Imperative (*):</label>
            <Form.Select
              id="input-motivation-type"
              aria-describedby="label-motivation-type"
              placeholder={t("page_criteria.select_imperative")}
              value={criterionForm?.imperative || ""}
              onChange={(e) => {
                if (!criterionForm) return;
                setCriterionForm({
                  ...criterionForm,
                  imperative: e.target.value,
                });
              }}
            >
              <>
                <option value="" disabled>
                  {t("fields.select_imperative")}
                </option>
                {imperatives.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </>
            </Form.Select>
            {showErrors && !criterionForm?.imperative && (
              <span className="text-danger">{t("required")}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="criterion-principle">Tag with Principle:</label>
            <Form.Select
              id="criterion-principle"
              aria-describedby="label-criterion-principle"
              value={principleTag || ""}
              onChange={(e) => setPrincipleTag(e.target.value || null)}
            >
              <option value="">No principle (Untagged)</option>
              {allPrinciples?.map((principle) => (
                <option key={principle.pri} value={principle.id}>
                  {principle.label}
                </option>
              ))}
            </Form.Select>
          </div>

          <div className="form-actions">
            <button className="btn-secondary" onClick={handleCancel}>
              Cancel
            </button>
            <button
              className="btn-primary"
              onClick={handleSubmit}
              disabled={
                formMode === "edit" &&
                (!criterionForm?.cri ||
                  !criterionForm?.label ||
                  !criterionForm?.description)
              }
            >
              {formMode === "edit" ? "Update Criterion" : "Create Criterion"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default AssessmentBuilderCriteria;
