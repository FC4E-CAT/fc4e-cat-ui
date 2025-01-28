import { useCreateTest, useGetAllTestMethods } from "@/api/services/registry";
import { AuthContext } from "@/auth";
import { AlertInfo, RegistryResource } from "@/types";
import { TestDefinitionInput, TestHeaderInput, TestParam } from "@/types/tests";
import { useContext, useEffect, useRef, useState } from "react";
import {
  Modal,
  Button,
  Form,
  InputGroup,
  Row,
  Col,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { FaFile, FaInfoCircle, FaTrash } from "react-icons/fa";

interface TestModalProps {
  show: boolean;
  onHide: () => void;
}
/**
 * Modal component for creating a test
 */
export function TestModal(props: TestModalProps) {
  const alert = useRef<AlertInfo>({
    message: "",
  });
  const { t } = useTranslation();
  const { keycloak, registered } = useContext(AuthContext)!;

  const [testMethods, setTestMethods] = useState<RegistryResource[]>([]);
  const [showErrors, setShowErrors] = useState(false);
  const [testHeader, setTestHeader] = useState<TestHeaderInput>({
    label: "",
    tes: "",
    description: "",
  });

  const [testDefinition, setTestDefinition] = useState<TestDefinitionInput>({
    test_method_id: "",
    label: "",
    param_type: "onscreen",
    test_params: "",
    test_question: "",
    tool_tip: "",
  });
  const [params, setParams] = useState<TestParam[]>([]);

  const addNewParam = (evidence: boolean) => {
    const id = params.length > 0 ? params[params.length - 1].id + 1 : 1;
    setParams([
      ...params,
      { id: id, name: evidence ? "evidence" : "", text: "", tooltip: "" },
    ]);
  };

  const updateParamTestDef = () => {
    // find first the evidence
    let names = "";
    let text = "";
    let tips = "";
    const evidence = params.find((item) => item.name === "evidence");
    const subParams = params.filter((item) => item.name !== "evidence");

    // iterate over params (minus evidence) and update test def
    subParams.map((item) => {
      names === "" ? (names = item.name) : (names = names + "|" + item.name);
      text === "" ? (text = item.text) : (text = text + "|" + item.text);
      tips === "" ? (tips = item.tooltip) : (tips = names + "|" + item.tooltip);
    });

    if (evidence !== undefined) {
      names === ""
        ? (names = evidence.name)
        : (names = names + "|" + evidence.name);
      text === ""
        ? (text = evidence.text)
        : (text = text + "|" + evidence.text);
      tips === ""
        ? (tips = evidence.tooltip)
        : (tips = names + "|" + evidence.tooltip);
    }

    setTestDefinition({
      ...testDefinition,
      test_question: text,
      test_params: names,
      tool_tip: tips,
    });
  };

  const updateParam = (id: number, field: keyof TestParam, value: string) => {
    setParams((prevParams) =>
      prevParams.map((param) =>
        param.id === id ? { ...param, [field]: value } : param,
      ),
    );
  };

  const removeParam = (id: number) => {
    setParams(params.filter((item) => item.id !== id));
  };

  const {
    data: tmData,
    fetchNextPage: tmFetchNextPage,
    hasNextPage: tmHasNextPage,
  } = useGetAllTestMethods({
    size: 5,
    token: keycloak?.token || "",
    isRegistered: registered,
  });

  useEffect(() => {
    setShowErrors(false);
    setTestHeader({
      label: "",
      tes: "",
      description: "",
    });
    setTestDefinition({
      test_method_id: "",
      label: "",
      param_type: "onscreen",
      test_params: "",
      test_question: "",
      tool_tip: "",
    });
    setParams([]);
  }, [props.show]);

  useEffect(() => {
    // gather all test methods
    let tmpTm: RegistryResource[] = [];

    // iterate over backend pages and gather all items in the metric types array
    if (tmData?.pages) {
      tmData.pages.map((page) => {
        tmpTm = [...tmpTm, ...page.content];
      });
      if (tmHasNextPage) {
        tmFetchNextPage();
      }
    }

    setTestMethods(tmpTm);
  }, [tmData, tmHasNextPage, tmFetchNextPage]);

  function handleValidate() {
    setShowErrors(true);
    return testHeader.tes !== "" && testHeader.label !== "";
  }

  const mutateCreate = useCreateTest(
    keycloak?.token || "",
    testHeader,
    testDefinition,
  );

  // handle backend call to add a new test
  function handleCreate() {
    updateParamTestDef();
    const promise = mutateCreate
      .mutateAsync()
      .catch((err) => {
        alert.current = {
          message: "Error: " + err.response.data.message,
        };
        throw err;
      })
      .then(() => {
        props.onHide();
        alert.current = {
          message: t("page_tests.toast_create_test_success"),
        };
      });
    toast.promise(promise, {
      loading: t("page_tests.toast_create_test_progress"),
      success: () => `${alert.current.message}`,
      error: () => `${alert.current.message}`,
    });
  }

  return (
    <Modal
      show={props.show}
      onHide={props.onHide}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header className="bg-success text-white" closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          <FaFile className="me-2" /> {t("page_tests.create_new_test")}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div>
          <Row>
            <Col xs={3}>
              <InputGroup className="mt-2">
                <OverlayTrigger
                  key="top"
                  placement="top"
                  overlay={
                    <Tooltip id={`tooltip-top`}>
                      {t("page_tests.tip_tes")}
                    </Tooltip>
                  }
                >
                  <InputGroup.Text id="label-test-tes">
                    <FaInfoCircle className="me-2" />{" "}
                    {t("fields.tes").toUpperCase()} (*):
                  </InputGroup.Text>
                </OverlayTrigger>
                <Form.Control
                  id="input-test-tes"
                  value={testHeader.tes}
                  onChange={(e) => {
                    setTestHeader({
                      ...testHeader,
                      tes: e.target.value,
                    });
                  }}
                  aria-describedby="label-metric-mtr"
                />
              </InputGroup>
              {showErrors && testHeader.tes === "" && (
                <span className="text-danger">{t("required")}</span>
              )}
            </Col>
            <Col>
              <InputGroup className="mt-2">
                <OverlayTrigger
                  key="top"
                  placement="top"
                  overlay={
                    <Tooltip id={`tooltip-top`}>
                      {t("page_tests.tip_test_label")}
                    </Tooltip>
                  }
                >
                  <InputGroup.Text id="label-test-label">
                    <FaInfoCircle className="me-2" /> {t("fields.label")} (*):
                  </InputGroup.Text>
                </OverlayTrigger>
                <Form.Control
                  id="input-test-label"
                  aria-describedby="label-test-label"
                  value={testHeader.label}
                  onChange={(e) => {
                    setTestHeader({
                      ...testHeader,
                      label: e.target.value,
                    });
                  }}
                />
              </InputGroup>
              {showErrors && testHeader.label === "" && (
                <span className="text-danger">{t("required")}</span>
              )}
            </Col>
          </Row>
          <Row className="mt-2">
            <Col className="mt-1">
              <OverlayTrigger
                key="top"
                placement="top"
                overlay={
                  <Tooltip id={`tooltip-top`}>
                    {t("page_tests.tip_test_description")}
                  </Tooltip>
                }
              >
                <span id="label-test-description">
                  <FaInfoCircle className="ms-1 me-2" />{" "}
                  {t("fields.description")} (*):
                </span>
              </OverlayTrigger>
              <Form.Control
                className="mt-1"
                as="textarea"
                rows={2}
                value={testHeader.description}
                onChange={(e) => {
                  setTestHeader({
                    ...testHeader,
                    description: e.target.value,
                  });
                }}
              />
              {showErrors && testHeader.description === "" && (
                <span className="text-danger">{t("required")}</span>
              )}
            </Col>
          </Row>
          <Row>
            <Col>
              <InputGroup className="mt-2">
                <OverlayTrigger
                  key="top"
                  placement="top"
                  overlay={
                    <Tooltip id={`tooltip-top`}>
                      {t("page_tests.tip_test_method")}
                    </Tooltip>
                  }
                >
                  <InputGroup.Text id="label-test-method">
                    <FaInfoCircle className="me-2" />{" "}
                    {t("page_tests.test_method")} (*):
                  </InputGroup.Text>
                </OverlayTrigger>
                <Form.Select
                  id="input-test-method"
                  aria-describedby="label-test-method"
                  placeholder={t("page_tests.select_test_method")}
                  value={
                    testDefinition.test_method_id
                      ? testDefinition.test_method_id
                      : ""
                  }
                  onChange={(e) => {
                    setTestDefinition({
                      ...testDefinition,
                      test_method_id: e.target.value,
                    });
                  }}
                >
                  <>
                    <option value="" disabled>
                      {t("page_tests.select_test_method")}
                    </option>
                    {testMethods.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </>
                </Form.Select>
              </InputGroup>
              {showErrors && testDefinition.test_method_id === "" && (
                <span className="text-danger">{t("required")}</span>
              )}
              {testDefinition.test_method_id != "" && (
                <div className="bg-light text-secondary border rounded mt-2 p-3">
                  <small>
                    <em>
                      {
                        testMethods.find(
                          (item) => item.id == testDefinition.test_method_id,
                        )?.description
                      }
                    </em>
                  </small>
                </div>
              )}
            </Col>
          </Row>
          <Row className="mt-2">
            <div className="border-top p-2">
              <strong>{t("page_tests.parameters")}:</strong>
              <Button
                size="sm"
                variant="success"
                className="ms-2"
                onClick={() => {
                  addNewParam(false);
                }}
              >
                {t("page_tests.parameters_add")}
              </Button>
              <Button
                size="sm"
                variant="success"
                className="ms-2"
                onClick={() => {
                  addNewParam(true);
                }}
                disabled={
                  params.find((item) => item.name === "evidence") !== undefined
                }
              >
                {t("page_tests.parameters_add_evidence")}
              </Button>
              <table>
                <thead>
                  {params.length > 0 && (
                    <tr>
                      <th>{t("fields.name")}</th>
                      <th>{t("fields.text")}</th>
                      <th>{t("fields.tooltip")}</th>
                      <th></th>
                    </tr>
                  )}
                </thead>
                <tbody>
                  {params.map((param) => {
                    return (
                      <tr key={`${param.id}`}>
                        <td>
                          <Form.Control
                            id={`param-${param.id}-name`}
                            value={param.name}
                            onChange={(e) => {
                              updateParam(param.id, "name", e.target.value);
                            }}
                            disabled={param.name === "evidence"}
                          />
                        </td>
                        <td>
                          <Form.Control
                            id={`param-${param.id}-text`}
                            value={param.text}
                            onChange={(e) => {
                              updateParam(param.id, "text", e.target.value);
                            }}
                          />
                        </td>
                        <td>
                          <Form.Control
                            id={`param-${param.id}-tooltip`}
                            value={param.tooltip}
                            onChange={(e) => {
                              updateParam(param.id, "tooltip", e.target.value);
                            }}
                          />
                        </td>
                        <td>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => {
                              removeParam(param.id);
                            }}
                          >
                            <FaTrash />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Row>
        </div>
      </Modal.Body>
      <Modal.Footer className="d-flex justify-content-between">
        <Button className="btn-secondary" onClick={props.onHide}>
          {t("buttons.close")}
        </Button>
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
      </Modal.Footer>
    </Modal>
  );
}
