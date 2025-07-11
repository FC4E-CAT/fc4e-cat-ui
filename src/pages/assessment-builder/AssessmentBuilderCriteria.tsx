import {
  useCreateCriterion,
  useUpdateMotivationPrinciplesCriteria,
  useGetAllImperatives,
  useGetMotivationActorCriteria,
  useUpdateCriterion,
  useUpdateMotivationActorCriteria,
} from "@/api";
import { AuthContext } from "@/auth";
import {
  AlertInfo,
  AssessmentPrinciple,
  Criterion,
  CriterionInput,
  Imperative,
  MotivationReference,
  PrincipleInput,
} from "@/types";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
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
import styles from "./AssessmentBuilder.module.css";

function AssessmentBuilderCriteria({
  assessment,
  setAssessment,
  formMode,
  mtvId,
  actId,
  allCriteria,
  allPrinciples,
  criterionId,
  motivationCriteriaMutation,
}: {
  assessment: AssessmentPrinciple[];
  setAssessment: React.Dispatch<React.SetStateAction<AssessmentPrinciple[]>>;
  formMode: "none" | "select" | "new" | "edit";
  mtvId?: string;
  actId?: string;
  allCriteria: Criterion[];
  allPrinciples?: (PrincipleInput & { id: string })[];
  criterionId?: string;
  motivationCriteriaMutation: {
    mutateAsync: (data: { mtvId: string }) => Promise<{ content: Criterion[] }>;
  };
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
  const [principleSearchTerm, setPrincipleSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isImperativesDropdownOpen, setIsImperativesDropdownOpen] =
    useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const imperativesDropdownRef = useRef<HTMLDivElement>(null);
  const scrollableContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
        setPrincipleSearchTerm("");
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        imperativesDropdownRef.current &&
        !imperativesDropdownRef.current.contains(event.target as Node)
      ) {
        setIsImperativesDropdownOpen(false);
      }
    };

    if (isImperativesDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isImperativesDropdownOpen]);

  function handleValidate() {
    setShowErrors(true);
    return (
      criterionForm?.cri !== "" &&
      criterionForm?.label !== "" &&
      criterionForm?.description !== "" &&
      criterionForm?.imperative !== ""
    );
  }

  const filteredCriteria = useMemo(
    () =>
      allCriteria.filter((criterion) => {
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
      }),
    [searchTerm, assessment, allCriteria],
  );

  const filteredPrinciplesForForm = useMemo(
    () =>
      allPrinciples?.filter((principle) => {
        if (!principleSearchTerm) return true;
        const term = principleSearchTerm.toLowerCase();
        return (
          principle.pri?.toLowerCase().includes(term) ||
          principle.label?.toLowerCase().includes(term) ||
          principle.description?.toLowerCase().includes(term)
        );
      }) || [],
    [allPrinciples, principleSearchTerm],
  );

  // Scroll to selected principle when dropdown opens
  useEffect(() => {
    if (isDropdownOpen && scrollableContainerRef.current && principleTag) {
      const selectedIndex =
        filteredPrinciplesForForm.findIndex((p) => p.id === principleTag) + 1;
      if (selectedIndex > 0) {
        const itemHeight = 32;
        const scrollTop = Math.max(
          0,
          selectedIndex * itemHeight -
            scrollableContainerRef.current.clientHeight / 2,
        );
        scrollableContainerRef.current.scrollTop = scrollTop;
      }
    }
  }, [isDropdownOpen, principleTag, filteredPrinciplesForForm]);

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

  // State for motivation hover tooltip
  const [hoveredCriterion, setHoveredCriterion] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

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

  // Handle scroll events to update tooltip position
  useEffect(() => {
    const updateTooltipPosition = (element: Element) => {
      const rect = element.getBoundingClientRect();
      const gridContainer = element.closest(".principles-grid");
      const gridRect = gridContainer?.getBoundingClientRect();

      setTooltipPosition({
        x: (gridRect?.left || 0) - 270,
        y: rect.top + rect.height / 2,
      });
    };

    const handleScroll = () => {
      if (hoveredCriterion) {
        // Find the currently hovered criterion element and update tooltip position
        const hoveredElement = document.querySelector(
          `[data-criterion-id="${hoveredCriterion}"]`,
        );
        if (hoveredElement) {
          updateTooltipPosition(hoveredElement);
        }
      }
    };

    const gridContainer = document.querySelector(".principles-grid");
    if (gridContainer && hoveredCriterion) {
      gridContainer.addEventListener("scroll", handleScroll, { passive: true });
      return () => {
        gridContainer.removeEventListener("scroll", handleScroll);
      };
    }
  }, [hoveredCriterion]);

  // Check if criterion can be edited based on motivation usage
  const canEditCriterion = (): boolean => {
    const criterion = allCriteria.find(
      (c) => c.id === selectedCriterionPidGraph,
    );

    console.log("canEditCriterion - criterion", criterion);
    if (criterion?.used_by_motivations?.length === 0) return true;

    const usedByMotivations = criterion?.used_by_motivations;

    if (Number(usedByMotivations?.length) > 1) {
      return false;
    }
    if (usedByMotivations?.length === 1) {
      const usedMotivation = usedByMotivations[0];
      if (usedMotivation.id === mtvId || usedMotivation?.lodMTV === mtvId) {
        return true;
      } else return false;
    }
    return true;
  };

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
      await motivationCriteriaMutation.mutateAsync({
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

    setSelectedRegistryCriterionId(null);

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

  const handleCriterionHover = (
    criterionId: string,
    event: React.MouseEvent,
  ) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const gridContainer = event.currentTarget.closest(".principles-grid");
    const gridRect = gridContainer?.getBoundingClientRect();

    setTooltipPosition({
      x: (gridRect?.left || 0) - 270, // Fixed distance from grid container left edge
      y: rect.top + rect.height / 2, // Center of the hovered card
    });
    setHoveredCriterion(criterionId);
  };

  // Handle criterion hover leave
  const handleCriterionHoverLeave = () => {
    setHoveredCriterion(null);
  };

  // Get the hovered criterion data
  const hoveredCriterionData = hoveredCriterion
    ? allCriteria.find(
        (criterion) =>
          criterion.id === hoveredCriterion ||
          criterion.cri === hoveredCriterion,
      )
    : null;

  // Check if current criterion can be edited
  const isEditingDisabled =
    formMode === "edit" && criterionId && !canEditCriterion();

  return (
    <>
      {formMode === "new" || formMode === "edit" ? (
        <div className={styles.principleForm}>
          <h4>
            {formMode === "edit" ? "Edit Criterion" : "Add New Criterion"}
          </h4>

          {isEditingDisabled && (
            <div className={styles.criterionEditWarning}>
              <span className={styles.warningIcon}>⚠️</span>

              <span className={styles.warningText}>
                Editing disabled - Used by other motivations
              </span>
            </div>
          )}
          <div className={styles.formGroup}>
            <label htmlFor="principle-pri">Cri (*):</label>
            <input
              id="principle-pri"
              type="text"
              className={styles.formControl}
              value={criterionForm?.cri}
              onChange={(e) =>
                handleCriterionInputChange("cri", e.target.value)
              }
              placeholder="Enter criterion identifier"
              disabled={formMode === "edit" || Boolean(isEditingDisabled)}
            />
            {showErrors && !criterionForm?.cri && (
              <span className="text-danger">{t("required")}</span>
            )}
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="criterion-label">Label (*):</label>
            <input
              id="criterion-label"
              type="text"
              className={styles.formControl}
              value={criterionForm?.label}
              onChange={(e) =>
                handleCriterionInputChange("label", e.target.value)
              }
              placeholder="Enter criterion label"
              disabled={Boolean(isEditingDisabled)}
            />
            {showErrors && !criterionForm?.label && (
              <span className="text-danger">{t("required")}</span>
            )}
          </div>
          <div className={`${styles.formGroup} m-0`}>
            <label htmlFor="criterion-description">Description (*):</label>
            <textarea
              id="criterion-description"
              className={styles.formControl}
              rows={3}
              value={criterionForm?.description}
              onChange={(e) =>
                handleCriterionInputChange("description", e.target.value)
              }
              placeholder="Enter criterion description"
              disabled={Boolean(isEditingDisabled)}
            />
            {showErrors && !criterionForm?.description && (
              <span className="text-danger">{t("required")}</span>
            )}
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="new-criterion-description">Imperative (*):</label>
            <div className="position-relative" ref={imperativesDropdownRef}>
              <div
                className={`${styles.formControl} d-flex justify-content-between align-items-center`}
                onClick={() =>
                  !isEditingDisabled &&
                  setIsImperativesDropdownOpen(!isImperativesDropdownOpen)
                }
                style={{
                  cursor: isEditingDisabled ? "not-allowed" : "pointer",
                  opacity: isEditingDisabled ? 0.6 : 1,
                }}
              >
                <span>
                  {criterionForm?.imperative
                    ? imperatives.find(
                        (imp) => imp.id === criterionForm.imperative,
                      )?.label || t("fields.select_imperative")
                    : t("fields.select_imperative")}
                </span>
                <span style={{ fontSize: "0.9rem", color: "#6c757d" }}>▼</span>
              </div>

              {isImperativesDropdownOpen && (
                <div
                  className="position-absolute w-100 bg-white border rounded shadow-sm"
                  style={{
                    top: "100%",
                    left: 0,
                    zIndex: 1050,
                    maxHeight: "200px",
                    marginTop: "0.25rem",
                  }}
                >
                  <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                    {imperatives.map((item) => (
                      <div
                        key={item.id}
                        className={`px-3 py-1 ${
                          criterionForm?.imperative === item.id
                            ? "bg-primary text-white"
                            : ""
                        }`}
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          if (!criterionForm) return;
                          setCriterionForm({
                            ...criterionForm,
                            imperative: item.id,
                          });
                          setIsImperativesDropdownOpen(false);
                        }}
                        onMouseEnter={(e) => {
                          if (criterionForm?.imperative === item.id) return;
                          e.currentTarget.style.backgroundColor = "#f8f9fa";
                        }}
                        onMouseLeave={(e) => {
                          if (criterionForm?.imperative === item.id) return;
                          e.currentTarget.style.backgroundColor = "";
                        }}
                      >
                        {item.label}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {showErrors && !criterionForm?.imperative && (
              <span className="text-danger">{t("required")}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="criterion-principle">Tag with Principle:</label>
            <div className="position-relative" ref={dropdownRef}>
              <div
                className={`${styles.formControl} d-flex justify-content-between align-items-center`}
                onClick={() =>
                  !isEditingDisabled && setIsDropdownOpen(!isDropdownOpen)
                }
                style={{
                  cursor: isEditingDisabled ? "not-allowed" : "pointer",
                  opacity: isEditingDisabled ? 0.6 : 1,
                }}
              >
                <span>
                  {principleTag
                    ? allPrinciples?.find((p) => p.id === principleTag)
                        ?.label || "No principle (Untagged)"
                    : "No principle (Untagged)"}
                </span>
                <span style={{ fontSize: "0.9rem", color: "#6c757d" }}>▼</span>
              </div>

              {isDropdownOpen && (
                <div
                  className="bg-white border rounded shadow-sm"
                  style={{
                    width: "100%",
                    top: "100%",
                    left: 0,
                    position: "absolute",
                    zIndex: 1050,
                    maxHeight: "300px",
                    marginTop: "0.25rem",
                  }}
                >
                  <div className="p-2 border-bottom">
                    <Form.Control
                      type="text"
                      size="sm"
                      placeholder="Search principles..."
                      value={principleSearchTerm}
                      onChange={(e) => setPrincipleSearchTerm(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div
                    style={{ maxHeight: "160px", overflowY: "auto" }}
                    ref={scrollableContainerRef}
                  >
                    <div
                      className={`px-3 py-1 ${!principleTag ? "bg-primary text-white" : ""}`}
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        setPrincipleTag(null);
                        setIsDropdownOpen(false);
                        setPrincipleSearchTerm("");
                      }}
                      onMouseEnter={(e) => {
                        if (!principleTag) return;
                        e.currentTarget.style.backgroundColor = "#f8f9fa";
                      }}
                      onMouseLeave={(e) => {
                        if (!principleTag) return;
                        e.currentTarget.style.backgroundColor = "";
                      }}
                    >
                      No principle (Untagged)
                    </div>

                    {filteredPrinciplesForForm.length === 0 &&
                    principleSearchTerm ? (
                      <div className="px-3 py-1 text-muted">
                        No principles found
                      </div>
                    ) : (
                      filteredPrinciplesForForm.map((principle) => (
                        <div
                          key={principle.pri}
                          className={`px-3 py-1 d-flex justify-content-between align-items-center ${
                            principleTag === principle.id
                              ? "bg-primary text-white"
                              : ""
                          }`}
                          style={{ cursor: "pointer" }}
                          onClick={() => {
                            setPrincipleTag(principle.id);
                            setIsDropdownOpen(false);
                            setPrincipleSearchTerm("");
                          }}
                          onMouseEnter={(e) => {
                            if (principleTag === principle.id) return;
                            e.currentTarget.style.backgroundColor = "#f8f9fa";
                          }}
                          onMouseLeave={(e) => {
                            if (principleTag === principle.id) return;
                            e.currentTarget.style.backgroundColor = "";
                          }}
                        >
                          <span className="pe-3">{principle.label}</span>
                          <small
                            className={
                              principleTag === principle.id
                                ? "text-white-50"
                                : "text-muted"
                            }
                          >
                            ({principle.pri})
                          </small>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className={styles.formActions}>
            <button
              className={styles.btnPrimary}
              onClick={handleSubmit}
              disabled={
                isEditingDisabled ||
                (formMode === "edit" &&
                  (!criterionForm?.cri ||
                    !criterionForm?.label ||
                    !criterionForm?.description))
              }
            >
              {formMode === "edit" ? "Update Criterion" : "Create Criterion"}
            </button>
          </div>
        </div>
      ) : (
        <div className={`${styles.principlesListContainer}`}>
          <div className={styles.principlesList}>
            <div className={styles.principlesListActions}>
              <button
                className={styles.selectPrincipleBtn}
                onClick={handleSubmit}
                disabled={!selectedRegistryCriterionId}
              >
                Select Criterion
              </button>
            </div>

            <div className={styles.formGroup}>
              <input
                type="text"
                className={`${styles.formControl} mb-1`}
                style={{ width: "98%", margin: "0 auto" }}
                placeholder="Search criteria by ID, label or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {filteredCriteria.length === 0 ? (
              <p className={styles.noPrinciples}>
                {searchTerm
                  ? "No criteria found matching your search"
                  : allCriteria.length === 0
                    ? "No criteria available"
                    : "All available criteria have been added"}
              </p>
            ) : (
              <div className={`${styles.principlesGrid} principles-grid`}>
                {filteredCriteria?.map((criterion) => (
                  <div
                    key={criterion.cri}
                    data-criterion-id={criterion.id}
                    className={`${styles.principleCard} ${selectedRegistryCriterionId === criterion.cri ? styles.selected : ""}`}
                    onClick={() =>
                      setSelectedRegistryCriterionId(criterion.cri)
                    }
                    onMouseEnter={(e) => handleCriterionHover(criterion.id, e)}
                    onMouseLeave={handleCriterionHoverLeave}
                  >
                    <div className={styles.principleCardCompactHeader}>
                      <FaTags className={styles.principleCardIcon} />
                      <span className={styles.principleCardCompactTitle}>
                        <span className={styles.principleCardPri}>
                          {criterion.cri}
                        </span>{" "}
                        - {criterion.label}
                      </span>
                    </div>
                    <p className={styles.principleCardDescription}>
                      {criterion.description}
                    </p>
                  </div>
                ))}

                {/* Motivations Tooltip */}
                {hoveredCriterion && hoveredCriterionData && (
                  <div
                    className={styles.motivationsTooltip}
                    style={{
                      left: tooltipPosition.x,
                      top: tooltipPosition.y,
                    }}
                  >
                    <div className={styles.tooltipHeader}>
                      <h6>🎯 Used in Motivations:</h6>
                    </div>
                    <div className={styles.tooltipContent}>
                      {!hoveredCriterionData.used_by_motivations ||
                      hoveredCriterionData.used_by_motivations.length === 0 ? (
                        <p>Not used in any motivations</p>
                      ) : (
                        <ul>
                          {hoveredCriterionData.used_by_motivations.map(
                            (
                              motivation: MotivationReference,
                              index: number,
                            ) => (
                              <li key={motivation.id || index}>
                                <strong>
                                  {motivation.mtv} - {motivation.label}
                                </strong>
                              </li>
                            ),
                          )}
                        </ul>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default AssessmentBuilderCriteria;
