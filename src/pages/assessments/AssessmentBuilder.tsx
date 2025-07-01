import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState, useContext, useRef, useEffect } from "react";
import { FaTags, FaInfoCircle } from "react-icons/fa";
import { OverlayTrigger, Tooltip, Button } from "react-bootstrap";
import { AuthContext } from "@/auth";
import {
  useGetAllPrinciples,
  useCreateMotivationPrinciple,
  useAssignPrinciplesToMotivation,
} from "@/api";
import { useGetMotivationAssessmentType } from "@/api/services/templates";
import { Principle, AlertInfo, PrincipleInput } from "@/types";
import toast from "react-hot-toast";
import "./AssessmentBuilder.css";

// Form modes for principle management
type PrincipleFormMode = "none" | "select" | "new" | "edit";

interface PrincipleFormState {
  mode: PrincipleFormMode;
  data: PrincipleInput;
  selectedIndex: number;
}

function AssessmentBuilder() {
  const { mtvId, actId } = useParams<{
    mtvId: string;
    actId?: string;
  }>();

  const { t } = useTranslation();
  const { keycloak, registered } = useContext(AuthContext)!;
  const alert = useRef<AlertInfo>({
    message: "",
  });
  const navigate = useNavigate();

  const { data: assessmentData } = useGetMotivationAssessmentType(
    mtvId || "",
    actId || "",
    keycloak?.token || "",
    registered,
  );

  const {
    data: principlesData,
    isLoading,
    fetchNextPage,
    hasNextPage,
  } = useGetAllPrinciples({
    token: keycloak?.token || "",
    isRegistered: registered,
    size: 50,
  });

  const [savedPrinciples, setSavedPrinciples] = useState<PrincipleInput[]>([]);
  const [principleForm, setPrincipleForm] = useState<PrincipleFormState>({
    mode: "none",
    data: { pri: "", label: "", description: "" },
    selectedIndex: -1,
  });
  const [selectedRegistryPrincipleId, setSelectedRegistryPrincipleId] =
    useState<string | null>(null);

  const mutateCreateMotivationPrinciple = useCreateMotivationPrinciple(
    keycloak?.token || "",
    mtvId || "",
    principleForm.data,
  );

  const mutateAssignPrinciplesToMotivation = useAssignPrinciplesToMotivation(
    keycloak?.token || "",
    mtvId || "",
  );

  const allPrinciples: Principle[] =
    principlesData?.pages?.flatMap((page) => page.content) || [];

  const availablePrinciples = allPrinciples.filter(
    (principle) =>
      !savedPrinciples.some(
        (savedPrinciple) => savedPrinciple.pri === principle.pri,
      ),
  );

  const selectedRegistryPrinciple = availablePrinciples.find(
    (p) => p.id === selectedRegistryPrincipleId,
  );

  // Load existing assessment data and populate saved principles
  useEffect(() => {
    if (assessmentData?.principles) {
      const loadedPrinciples: PrincipleInput[] = assessmentData.principles.map(
        (principle) => ({
          pri: principle.id,
          label: principle.name,
          description: principle.description,
        }),
      );
      setSavedPrinciples(loadedPrinciples);
    }
  }, [assessmentData]);

  const handleAddPrinciple = () => {
    setPrincipleForm({
      mode: "select",
      data: { pri: "", label: "", description: "" },
      selectedIndex: -1,
    });
    setSelectedRegistryPrincipleId(null);
  };

  const handleSelectTab = () => {
    setPrincipleForm({
      ...principleForm,
      mode: "select",
      data: { pri: "", label: "", description: "" },
    });
  };

  const handleNewTab = () => {
    setPrincipleForm({
      ...principleForm,
      mode: "new",
      data: { pri: "", label: "", description: "" },
    });
  };

  const handleEditTab = () => {
    // If there are saved principles, automatically select the first one for editing
    if (savedPrinciples.length > 0) {
      const firstPrinciple = savedPrinciples[0];
      setPrincipleForm({
        mode: "edit",
        data: {
          pri: firstPrinciple.pri,
          label: firstPrinciple.label,
          description: firstPrinciple.description,
        },
        selectedIndex: 0,
      });
    }
  };

  const handleEditPrinciple = (principleIndex: number) => {
    const principle = savedPrinciples[principleIndex];
    setPrincipleForm({
      mode: "edit",
      data: {
        pri: principle.pri,
        label: principle.label,
        description: principle.description,
      },
      selectedIndex: principleIndex,
    });
  };

  const hasEditPrincipleChanged = () => {
    if (principleForm.mode !== "edit" || principleForm.selectedIndex < 0) {
      return false;
    }
    const originalPrinciple = savedPrinciples[principleForm.selectedIndex];
    if (!originalPrinciple) {
      return false;
    }
    return (
      principleForm.data.pri !== originalPrinciple.pri ||
      principleForm.data.label !== originalPrinciple.label ||
      principleForm.data.description !== originalPrinciple.description
    );
  };

  const handlePrincipleInputChange = (
    field: keyof PrincipleInput,
    value: string,
  ) => {
    setPrincipleForm({
      ...principleForm,
      data: {
        ...principleForm.data,
        [field]: value,
      },
    });
  };

  const assignPrincipleToMotivationRequest = ({
    pri,
    label,
    description,
  }: PrincipleInput) => {
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

        const newPrinciple: PrincipleInput = {
          pri: pri,
          label: label,
          description: description,
        };
        const updatedPrinciples = [...savedPrinciples, newPrinciple];
        setSavedPrinciples(updatedPrinciples);

        const newPrincipleIndex = updatedPrinciples.length - 1;
        setPrincipleForm({
          mode: "edit",
          data: {
            pri: newPrinciple.pri,
            label: newPrinciple.label,
            description: newPrinciple.description,
          },
          selectedIndex: newPrincipleIndex,
        });
      });

    toast.promise(promise, {
      loading: "Adding principle to motivation...",
      success: () => `${alert.current.message}`,
      error: () => `${alert.current.message}`,
    });
  };

  const assignSelectedPrincipleToMotivation = () => {
    if (!selectedRegistryPrinciple || !mtvId) return;

    const principleAssignments = [
      {
        principle_id: selectedRegistryPrinciple.id,
        relation: "maintainedBy", // You can make this configurable if needed
        annotation_text: "",
        annotation_url: "",
      },
    ];

    const promise = mutateAssignPrinciplesToMotivation
      .mutateAsync(principleAssignments)
      .catch((err) => {
        alert.current = {
          message: "Error: " + (err.response?.data?.message || err.message),
        };
        throw err;
      })
      .then(() => {
        alert.current = {
          message: "Principle assigned to motivation successfully",
        };

        const newPrinciple: PrincipleInput = {
          pri: selectedRegistryPrinciple.pri,
          label: selectedRegistryPrinciple.label,
          description: selectedRegistryPrinciple.description,
        };
        const updatedPrinciples = [...savedPrinciples, newPrinciple];
        setSavedPrinciples(updatedPrinciples);

        const newPrincipleIndex = updatedPrinciples.length - 1;
        setPrincipleForm({
          mode: "edit",
          data: {
            pri: newPrinciple.pri,
            label: newPrinciple.label,
            description: newPrinciple.description,
          },
          selectedIndex: newPrincipleIndex,
        });

        // Clear the selected registry principle
        setSelectedRegistryPrincipleId(null);
      });

    toast.promise(promise, {
      loading: "Assigning principle to motivation...",
      success: () => `${alert.current.message}`,
      error: () => `${alert.current.message}`,
    });
  };

  const handlePrincipleChanges = () => {
    if (principleForm.mode === "select") {
      // Assign selected principle from registry to motivation
      if (selectedRegistryPrincipleId && mtvId) {
        assignSelectedPrincipleToMotivation();
      } else if (!mtvId) {
        if (selectedRegistryPrinciple) {
          const newPrinciple: PrincipleInput = {
            pri: selectedRegistryPrinciple.pri,
            label: selectedRegistryPrinciple.label,
            description: selectedRegistryPrinciple.description,
          };
          const updatedPrinciples = [...savedPrinciples, newPrinciple];
          setSavedPrinciples(updatedPrinciples);

          // Automatically select the newly added principle for preview
          const newPrincipleIndex = updatedPrinciples.length - 1;
          setPrincipleForm({
            mode: "edit",
            data: {
              pri: newPrinciple.pri,
              label: newPrinciple.label,
              description: newPrinciple.description,
            },
            selectedIndex: newPrincipleIndex,
          });
          setSelectedRegistryPrincipleId(null);
        }
      }
    } else if (principleForm.mode === "new") {
      if (
        principleForm.data.pri &&
        principleForm.data.label &&
        principleForm.data.description
      ) {
        if (mtvId) {
          assignPrincipleToMotivationRequest({
            pri: principleForm.data.pri,
            label: principleForm.data.label,
            description: principleForm.data.description,
          });
        } else {
          const newPrinciple: PrincipleInput = {
            ...principleForm.data,
          };
          const updatedPrinciples = [...savedPrinciples, newPrinciple];
          setSavedPrinciples(updatedPrinciples);

          // Automatically select the newly created principle for preview
          const newPrincipleIndex = updatedPrinciples.length - 1;
          setPrincipleForm({
            mode: "edit",
            data: {
              pri: newPrinciple.pri,
              label: newPrinciple.label,
              description: newPrinciple.description,
            },
            selectedIndex: newPrincipleIndex,
          });
        }
      }
    } else if (principleForm.mode === "edit") {
      if (
        principleForm.data.pri &&
        principleForm.data.label &&
        principleForm.data.description &&
        principleForm.selectedIndex >= 0
      ) {
        const updatedPrinciples = [...savedPrinciples];
        updatedPrinciples[principleForm.selectedIndex] = {
          ...updatedPrinciples[principleForm.selectedIndex],
          pri: principleForm.data.pri,
          label: principleForm.data.label,
          description: principleForm.data.description,
        };
        setSavedPrinciples(updatedPrinciples);
      }
    }
  };

  const handleCancel = () => {
    setPrincipleForm({
      mode: "none",
      data: { pri: "", label: "", description: "" },
      selectedIndex: -1,
    });
  };

  return (
    <>
      <div className="assessment-builder mb-3">
        <div className="assessment-builder-header">
          <div className="header-content">
            <h1 className="builder-title">Assessment Builder</h1>
            <div className="header-actions">
              <button className="btn-secondary">Preview</button>
              <button className="btn-primary">Publish</button>
            </div>
          </div>
        </div>

        {/* Main Layout - Three Columns */}
        <div className="builder-layout">
          {/* Left Column - Assessment Structure */}
          <div className="builder-column structure-column">
            <div className="column-header">
              <h3>Assessment Structure</h3>
              <button
                className="add-principle-btn"
                onClick={handleAddPrinciple}
              >
                + Add Principle
              </button>
            </div>
            <div className="column-content">
              <div className="structure-tree">
                {savedPrinciples.map((principle, principleIndex) => (
                  <div key={principleIndex}>
                    <div
                      className={`tree-item principle-item clickable ${
                        principleForm.selectedIndex === principleIndex
                          ? "selected"
                          : ""
                      }`}
                      onClick={() => handleEditPrinciple(principleIndex)}
                    >
                      <span className="tree-icon">
                        <FaTags />
                      </span>
                      <span className="principle-display">
                        {principle.pri} - {principle.label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Center Column - Live Preview */}
          <div className="builder-column preview-column">
            <div className="column-header">
              <div>
                <h3>Live Preview</h3>
                <p className="column-description">
                  Preview how users will see this assessment
                </p>
              </div>
            </div>
            <div className="column-content">
              {principleForm.selectedIndex >= 0 ? (
                <div className="principle-preview">
                  <div className="cat-view-heading">
                    <span className="h5 align-middle">
                      Part of Principle{" "}
                      {savedPrinciples[principleForm.selectedIndex]?.pri}:{" "}
                      {savedPrinciples[principleForm.selectedIndex]?.label}
                    </span>
                    <OverlayTrigger
                      placement="top"
                      overlay={
                        <Tooltip
                          id={`tip-pri-${savedPrinciples[principleForm.selectedIndex]?.pri}`}
                        >
                          {
                            savedPrinciples[principleForm.selectedIndex]
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
                </div>
              ) : (
                <div className="preview-placeholder">
                  <p>Select a principle to see the live preview</p>
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
                    className={`tab-btn ${principleForm.mode === "select" ? "active" : ""} ${principleForm.mode === "none" ? "disabled" : ""}`}
                    onClick={handleSelectTab}
                    disabled={
                      principleForm.mode === "none" ||
                      principleForm.mode === "edit"
                    }
                  >
                    Select
                  </button>
                  <div className="tab-divider" />
                  <button
                    className={`tab-btn ${principleForm.mode === "new" ? "active" : ""} ${principleForm.mode === "none" ? "disabled" : ""}`}
                    onClick={handleNewTab}
                    disabled={
                      principleForm.mode === "none" ||
                      principleForm.mode === "edit"
                    }
                  >
                    New
                  </button>
                  <div className="tab-divider" />
                  <button
                    className={`tab-btn ${principleForm.mode === "edit" ? "active" : ""} ${savedPrinciples.length === 0 || principleForm.mode === "select" || principleForm.mode === "new" ? "disabled" : ""}`}
                    onClick={handleEditTab}
                    disabled={
                      savedPrinciples.length === 0 ||
                      principleForm.mode === "select" ||
                      principleForm.mode === "new"
                    }
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
            <div className="column-content">
              {principleForm.mode === "select" ? (
                <div className="principles-list-container">
                  <div className="principles-list">
                    <div className="principles-list-actions">
                      <button
                        className="select-principle-btn"
                        onClick={handlePrincipleChanges}
                        disabled={!selectedRegistryPrincipleId}
                      >
                        Select Principle
                      </button>
                    </div>

                    {isLoading ? (
                      <p className="no-principles">Loading principles...</p>
                    ) : availablePrinciples.length === 0 ? (
                      <p className="no-principles">
                        {allPrinciples.length === 0
                          ? "No principles available."
                          : "All available principles have been added."}
                      </p>
                    ) : (
                      <div className="principles-grid">
                        {availablePrinciples.map((principle) => (
                          <div
                            key={principle.id}
                            className={`principle-card ${selectedRegistryPrincipleId === principle.id ? "selected" : ""}`}
                            onClick={() =>
                              setSelectedRegistryPrincipleId(principle.id)
                            }
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
                        {hasNextPage && (
                          <button
                            className="btn-secondary"
                            onClick={() => fetchNextPage()}
                          >
                            Load More
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : principleForm.mode === "new" ? (
                <div className="principle-form">
                  <h4>Add New Principle</h4>
                  <div className="form-group">
                    <label htmlFor="principle-pri">Pri (*):</label>
                    <input
                      id="principle-pri"
                      type="text"
                      className="form-control"
                      value={principleForm.data.pri}
                      onChange={(e) =>
                        handlePrincipleInputChange("pri", e.target.value)
                      }
                      placeholder="Enter principle identifier"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="principle-label">Label (*):</label>
                    <input
                      id="principle-label"
                      type="text"
                      className="form-control"
                      value={principleForm.data.label}
                      onChange={(e) =>
                        handlePrincipleInputChange("label", e.target.value)
                      }
                      placeholder="Enter principle label"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="principle-description">
                      Description (*):
                    </label>
                    <textarea
                      id="principle-description"
                      className="form-control"
                      rows={3}
                      value={principleForm.data.description}
                      onChange={(e) =>
                        handlePrincipleInputChange(
                          "description",
                          e.target.value,
                        )
                      }
                      placeholder="Enter principle description"
                    />
                  </div>

                  <div className="form-actions">
                    <button className="btn-secondary" onClick={handleCancel}>
                      Cancel
                    </button>
                    <button
                      className="btn-primary"
                      onClick={handlePrincipleChanges}
                    >
                      Create Principle
                    </button>
                  </div>
                </div>
              ) : principleForm.mode === "edit" ? (
                <div className="principle-form">
                  <h4 className="edit-title">Edit Principle</h4>

                  <div className="form-group">
                    <label htmlFor="edit-principle-pri">Pri (*):</label>
                    <input
                      id="edit-principle-pri"
                      type="text"
                      className="form-control"
                      value={principleForm.data.pri}
                      onChange={(e) =>
                        handlePrincipleInputChange("pri", e.target.value)
                      }
                      placeholder="Enter principle identifier"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="edit-principle-label">Label (*):</label>
                    <input
                      id="edit-principle-label"
                      type="text"
                      className="form-control"
                      value={principleForm.data.label}
                      onChange={(e) =>
                        handlePrincipleInputChange("label", e.target.value)
                      }
                      placeholder="Enter principle label"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="edit-principle-description">
                      Description (*):
                    </label>
                    <textarea
                      id="edit-principle-description"
                      className="form-control"
                      rows={3}
                      value={principleForm.data.description}
                      onChange={(e) =>
                        handlePrincipleInputChange(
                          "description",
                          e.target.value,
                        )
                      }
                      placeholder="Enter principle description"
                    />
                  </div>

                  <div className="form-actions">
                    <button className="btn-secondary" onClick={handleCancel}>
                      Cancel
                    </button>
                    <button
                      className="btn-primary"
                      onClick={handlePrincipleChanges}
                      disabled={
                        !hasEditPrincipleChanged() ||
                        !principleForm.data.pri ||
                        !principleForm.data.label ||
                        !principleForm.data.description
                      }
                    >
                      Update Principle
                    </button>
                  </div>
                </div>
              ) : null}
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
