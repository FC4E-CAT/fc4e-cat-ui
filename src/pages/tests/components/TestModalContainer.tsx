import { Modal, Button } from "react-bootstrap";
import { FaFile, FaEdit, FaCodeBranch } from "react-icons/fa";
import { RegistryResource } from "@/types";
import { TestDefinitionInput, TestHeaderInput, TestParam } from "@/types/tests";
import TestPreviewModal from "./TestPreviewModal";
import { useTranslation } from "react-i18next";
import TestHeaderForm from "./TestHeaderForm";
import TestMethodAndParams from "./TestMethodAndParams";

export interface TestModalUIProps {
  id: string;
  show: boolean;
  isEditing?: boolean;
  isVersioning?: boolean;
  onHide: () => void;
  testMethods: RegistryResource[];
  showErrors: boolean;
  testHeader: TestHeaderInput;
  testDefinition: TestDefinitionInput;
  params: TestParam[];
  hasEvidence: boolean;
  areParamsDisabled: boolean;
  setTestHeader: (value: TestHeaderInput) => void;
  setTestDefinition: (value: TestDefinitionInput) => void;
  setHasEvidence: (value: boolean) => void;
  addNewParam: () => void;
  updateParam: (id: number, field: keyof TestParam, value: string) => void;
  removeParam: (id: number) => void;
  handleValidate: () => boolean;
  handleCreate: () => void;
  handleUpdate: () => void;
  handleCreateNewVersion: () => void;
}

function TestModalContainer(props: TestModalUIProps) {
  const {
    id,
    show,
    isEditing,
    isVersioning,
    onHide,
    testMethods,
    showErrors,
    testHeader,
    testDefinition,
    params,
    hasEvidence,
    areParamsDisabled,
    setTestHeader,
    setTestDefinition,
    setHasEvidence,
    addNewParam,
    updateParam,
    removeParam,
    handleValidate,
    handleCreate,
    handleUpdate,
    handleCreateNewVersion,
  } = props;

  const { t } = useTranslation();

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="xl"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      scrollable
    >
      <Modal.Header closeButton>
        <Modal.Title
          className="d-flex align-items-center gap-1"
          id="contained-modal-title-vcenter"
        >
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
        </Modal.Title>
      </Modal.Header>
      <Modal.Body
        style={{
          display: "flex",
          gap: "1rem",
        }}
      >
        <div style={{ width: "50%" }}>
          <TestHeaderForm
            testHeader={testHeader}
            setTestHeader={setTestHeader}
            showErrors={showErrors}
            isEditing={isEditing}
            isVersioning={isVersioning}
          />
          <TestMethodAndParams
            testMethods={testMethods}
            testDefinition={testDefinition}
            setTestDefinition={setTestDefinition}
            params={params}
            showErrors={showErrors}
            setHasEvidence={setHasEvidence}
            hasEvidence={hasEvidence}
            areParamsDisabled={areParamsDisabled}
            addNewParam={addNewParam}
            updateParam={updateParam}
            removeParam={removeParam}
          />
        </div>
        <div
          style={{
            width: "1px",
            height: "auto",
            backgroundColor: "#ccc",
            margin: "0 1rem",
            position: "sticky",
            top: 0,
          }}
        ></div>
        <div style={{ width: "50%" }}>
          <TestPreviewModal
            testHeader={testHeader}
            testDefinition={testDefinition}
            params={params}
            testMethodName={
              testMethods.find((m) => m.id === testDefinition.test_method_id)
                ?.label
            }
            hasEvidenceParam={hasEvidence}
          />
        </div>
      </Modal.Body>

      <Modal.Footer className="d-flex justify-content-between">
        <Button className="btn-secondary" onClick={onHide}>
          {t("buttons.cancel")}
        </Button>
        {id && isVersioning ? (
          <Button
            className="btn-success"
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
            className="btn-success"
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
            className="btn-success"
            onClick={() => {
              if (handleValidate() === true) {
                handleCreate();
              }
            }}
          >
            {t("buttons.create")}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
}

export default TestModalContainer;
