import { Button } from "react-bootstrap";
import { FaFile, FaEdit, FaCodeBranch } from "react-icons/fa";
import { RegistryResource } from "@/types";
import { TestInput, TestParam } from "@/types/tests";
import TestPreviewModal from "./TestPreviewModal";
import { useTranslation } from "react-i18next";
import TestHeaderForm from "./TestHeaderForm";
import TestMethodAndParams from "./TestMethodAndParams";

export interface TestModalUIProps {
  id?: string;
  show?: boolean;
  onHide?: () => void;
  addNewParam?: () => void;
  removeParam?: (id: number) => void;
  isEditing?: boolean;
  isVersioning?: boolean;
  testMethods: RegistryResource[];
  showErrors: boolean;
  test: TestInput;
  params: TestParam[];
  hasEvidence: boolean;
  areParamsDisabled: boolean;
  searchTerm?: string;
  filterType?: string;
  isSearching?: boolean;
  setTest: (value: TestInput) => void;
  setHasEvidence: (value: boolean) => void;
  updateParam: (id: number, field: keyof TestParam, value: string) => void;
  handleValidate: () => boolean;
  handleCreate: () => void;
  handleUpdate: () => void;
  handleCreateNewVersion: () => void;
  handleSearchChange?: (value: string) => void;
  handleFilterChange?: (value: string) => void;
}

function TestModalContainer(props: TestModalUIProps) {
  const {
    id,
    isEditing,
    isVersioning,
    testMethods,
    showErrors,
    test,
    params,
    hasEvidence,
    areParamsDisabled,
    searchTerm = "",
    filterType = "all",
    isSearching = false,
    setTest,
    setHasEvidence,
    updateParam,
    handleValidate,
    handleCreate,
    handleUpdate,
    handleCreateNewVersion,
    handleSearchChange,
    handleFilterChange,
  } = props;

  console.log("test:", test);

  const { t } = useTranslation();

  return (
    <div className="test-container py-3 px-5">
      <div className="row mb-3">
        <div className="col-12">
          <div className="d-flex align-items-center">
            <h2>
              {id && isVersioning ? (
                <>
                  <FaCodeBranch className="me-2" />
                  {t("page_tests.create_new_version")}
                </>
              ) : id && isEditing ? (
                <>
                  <FaEdit className="me-2" />
                  {t("page_tests.update")}
                </>
              ) : (
                <>
                  <FaFile className="me-2" />
                  {t("page_tests.create_new")}
                </>
              )}
            </h2>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-4 col-lg-3">
          <div className="test-methods-sidebar-container border rounded-3 shadow-sm d-flex flex-column">
            <div className="p-3 border-bottom bg-light flex-shrink-0 rounded-top-3">
              <h6 className="mb-0 fw-bold test-section-header">Test Methods</h6>
              <small className="test-header-description">
                Select a test method to add to your assessment
              </small>
            </div>

            {/* Search Box */}
            <div className="my-2 px-3">
              <input
                type="text"
                className="form-control form-control-sm rounded-2"
                placeholder="Search test methods..."
                value={searchTerm}
                onChange={(e) => handleSearchChange?.(e.target.value)}
              />
            </div>

            {/* Filter Type Radio Buttons */}
            <div className="d-flex justify-content-center px-1 mb-2 gap-2">
              <div className="form-check form-check-inline">
                <input
                  className="form-check-input"
                  type="radio"
                  id="filterAll"
                  name="filterType"
                  value="all"
                  checked={filterType === "all"}
                  onChange={() => handleFilterChange?.("all")}
                />
                <label className="form-check-label" htmlFor="filterAll">
                  All
                </label>
              </div>
              <div className="form-check form-check-inline">
                <input
                  className="form-check-input"
                  type="radio"
                  id="filterManual"
                  name="filterType"
                  value="manual"
                  checked={filterType === "manual"}
                  onChange={() => handleFilterChange?.("manual")}
                />
                <label className="form-check-label" htmlFor="filterManual">
                  Manual Tests
                </label>
              </div>
              <div className="form-check form-check-inline">
                <input
                  className="form-check-input"
                  type="radio"
                  id="filterAuto"
                  name="filterType"
                  value="automated"
                  checked={filterType === "automated"}
                  onChange={() => handleFilterChange?.("automated")}
                />
                <label className="form-check-label" htmlFor="filterAuto">
                  Automated Tests
                </label>
              </div>
            </div>

            <div
              className="test-methods-list flex-grow-1"
              style={{
                overflowY: "auto",
                overflowX: "hidden",
                minHeight: 0,
                maxHeight: "100%",
              }}
            >
              {isSearching ? (
                <div className="test-method-spinner">
                  <div
                    className="spinner-border spinner-border-sm text-primary me-2"
                    role="status"
                  >
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <span>Searching...</span>
                </div>
              ) : testMethods.length === 0 ? (
                <div className="test-method-empty">
                  No test methods found. Try adjusting your search criteria.
                </div>
              ) : (
                testMethods.map((method) => (
                  <div
                    key={method.id}
                    onClick={() =>
                      setTest({ ...test, test_method_id: method.id })
                    }
                    className={`test-method-item border-bottom ${
                      test.test_method_id === method.id ? "selected-method" : ""
                    }`}
                    style={{
                      cursor: "pointer",
                      borderLeft:
                        test.test_method_id === method.id
                          ? "3px solid #007bff"
                          : "3px solid transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (test.test_method_id !== method.id) {
                        e.currentTarget.style.background = "#f8f9fa";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (test.test_method_id !== method.id) {
                        e.currentTarget.style.background = "transparent";
                      }
                    }}
                  >
                    <div className="fw-bold mb-1 test-method-label">
                      {method.label}
                    </div>
                    <div className="test-method-description">
                      {method.description}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Configure Your Test Content Container */}
        <div className="col-md-8 col-lg-9">
          <div className="test-content-container border rounded-3 shadow-sm">
            <div className="p-3 border-bottom bg-light flex-shrink-0 rounded-top-3">
              <h6 className="mb-0 fw-bold test-section-header">
                {testMethods.find((m) => m.id === test?.test_method_id)
                  ?.label || "Configure your test"}
              </h6>
              <small className="test-header-description">
                {test?.test_method_id
                  ? "Configure test parameters and preview below"
                  : "Select a test method from the left sidebar to get started"}
              </small>
            </div>
            <div className="px-4 py-3">
              <TestHeaderForm
                isEditing={isEditing}
                isVersioning={isVersioning}
                setTest={setTest}
                showErrors={showErrors}
                test={test}
              />
              {test?.test_method_id && (
                <TestMethodAndParams
                  test={test}
                  setTest={setTest}
                  params={params}
                  showErrors={showErrors}
                  setHasEvidence={setHasEvidence}
                  hasEvidence={hasEvidence}
                  areParamsDisabled={areParamsDisabled}
                  updateParam={updateParam}
                />
              )}
              <hr className="my-3" />
              <div className="test-preview-section">
                <div className="mb-1 test-section-header">Preview Test</div>
                <div className="border rounded bg-light p-3">
                  <TestPreviewModal
                    test={test}
                    params={params}
                    testMethodName={
                      testMethods.find((m) => m.id === test?.test_method_id)
                        ?.label
                    }
                    hasEvidenceParam={hasEvidence}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row mt-5">
        <div className="col-12">
          <div className="d-flex justify-content-between">
            <Button className="btn btn-secondary" href="/admin/tests">
              Back
            </Button>
            {id && isVersioning ? (
              <Button
                className="btn btn-success"
                onClick={() => {
                  if (handleValidate() === true) {
                    handleCreateNewVersion();
                  }
                }}
              >
                {t("buttons.create_version")}
              </Button>
            ) : id && isEditing ? (
              <Button
                className="btn btn-success"
                onClick={() => {
                  if (handleValidate() === true) {
                    handleUpdate();
                  }
                }}
              >
                {t("buttons.update")}
              </Button>
            ) : (
              <Button
                className="btn btn-success"
                onClick={() => {
                  if (handleValidate() === true) {
                    handleCreate();
                  }
                }}
              >
                {t("buttons.create")}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TestModalContainer;
