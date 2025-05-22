import {
  OverlayTrigger,
  Row,
  Tooltip,
  Col,
  InputGroup,
  Form,
  Button,
} from "react-bootstrap";
import { FaInfoCircle, FaTrash } from "react-icons/fa";
import { RegistryResource } from "@/types";
import { TestInput, TestParam } from "@/types/tests";
import { useTranslation } from "react-i18next";

interface TestMethodAndParamsProps {
  testMethods: RegistryResource[];
  showErrors: boolean;
  test: TestInput;
  params: TestParam[];
  hasEvidence: boolean;
  areParamsDisabled: boolean;
  setTest: (value: TestInput) => void;
  setHasEvidence: (value: boolean) => void;
  addNewParam: () => void;
  updateParam: (id: number, field: keyof TestParam, value: string) => void;
  removeParam: (id: number) => void;
}

function TestMethodAndParams(props: TestMethodAndParamsProps) {
  const {
    testMethods,
    showErrors,
    test,
    params,
    hasEvidence,
    areParamsDisabled,
    setTest,
    setHasEvidence,
    addNewParam,
    updateParam,
    removeParam,
  } = props;
  const { t } = useTranslation();

  return (
    <>
      <Row>
        <Col className="mb-1">
          <InputGroup className="mt-2">
            <InputGroup.Text id="label-test-method">
              <OverlayTrigger
                placement="top"
                overlay={
                  <Tooltip id={`tooltip-top`}>
                    {t("page_tests.tip_test_method")}
                  </Tooltip>
                }
              >
                <span className="me-2 d-flex align-items-center">
                  <FaInfoCircle />
                </span>
              </OverlayTrigger>
              {t("page_tests.test_method")} (*):
            </InputGroup.Text>
            <Form.Select
              id="input-test-method"
              aria-describedby="label-test-method"
              placeholder={t("page_tests.select_test_method")}
              onChange={(e) => {
                setTest({
                  ...test,
                  test_method_id: e.target.value,
                });
              }}
              value={test.test_method_id ? test.test_method_id : ""}
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
          {showErrors && test.test_method_id === "" && (
            <span className="text-danger">{t("required")}</span>
          )}
          {test.test_method_id != "" && (
            <div className="bg-light text-secondary border rounded mt-2 p-3">
              <small>
                {
                  testMethods.find((item) => item.id == test.test_method_id)
                    ?.description
                }
              </small>
            </div>
          )}
        </Col>
      </Row>
      <Row className="mt-2">
        <div className="border-top p-2 ms-2">
          <div className="d-flex align-items-center mb-3 mt-2">
            <div className="me-3 d-flex align-items-center">
              <span className="me-1 ">Evidence parameter</span>
              <OverlayTrigger
                placement="top"
                overlay={
                  <Tooltip id="evidence-tooltip">
                    Please provide an evidence of via a public source or URL to
                    validate the information with an official reference.
                  </Tooltip>
                }
              >
                <span>
                  <FaInfoCircle className="mb-1" />
                </span>
              </OverlayTrigger>
            </div>
            {areParamsDisabled ? (
              <OverlayTrigger
                placement="top"
                overlay={
                  <Tooltip id="toggle-tooltip">
                    You must select a test method before adding an evidence
                    parameter
                  </Tooltip>
                }
              >
                <Form.Check
                  aria-label="evidence-toggle"
                  checked={hasEvidence}
                  id="evidence-toggle"
                  isValid
                  onChange={(e) => {
                    console.log("e.target.checked", e.target.checked);
                    if (e.target.checked && areParamsDisabled) {
                      return;
                    }
                    setHasEvidence(e.target.checked);
                  }}
                  type="switch"
                />
              </OverlayTrigger>
            ) : (
              <Form.Check
                aria-label="evidence-toggle"
                checked={hasEvidence}
                id="evidence-toggle"
                isValid
                onChange={(e) => {
                  setHasEvidence(e.target.checked);
                }}
                type="switch"
              />
            )}
          </div>
          <div className="d-flex align-items-center mb-3">
            <span>{t("page_tests.parameters")}:</span>
            {areParamsDisabled ? (
              <OverlayTrigger
                placement="top"
                overlay={
                  <Tooltip id="toggle-tooltip">
                    You must select a test method before adding parameters
                  </Tooltip>
                }
              >
                <Button
                  className="ms-2"
                  size="sm"
                  variant="success"
                  onClick={() => {
                    if (areParamsDisabled) {
                      return;
                    }
                    addNewParam();
                  }}
                >
                  {t("page_tests.parameters_add")}
                </Button>
              </OverlayTrigger>
            ) : (
              <Button
                className="ms-2"
                size="sm"
                variant="success"
                onClick={() => {
                  addNewParam();
                }}
              >
                {t("page_tests.parameters_add")}
              </Button>
            )}
          </div>

          {params?.length > 0 &&
            params.map((param, index) => (
              <div key={`param-group-${param.id}`}>
                <div className="d-flex flex-column gap-2">
                  <div className="w-100 d-flex justify-content-between gap-3">
                    <Form.Control
                      id={`param-${param.id}-name`}
                      value={param.name}
                      onChange={(e) => {
                        updateParam(param.id, "name", e.target.value);
                      }}
                      placeholder="Name (*)"
                      size="sm"
                      className="w-50"
                    />
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => {
                        removeParam(param.id);
                      }}
                    >
                      <FaTrash />
                    </Button>
                  </div>

                  <Form.Control
                    as="textarea"
                    rows={2}
                    id={`param-${param.id}-text`}
                    value={param.text}
                    onChange={(e) => {
                      updateParam(param.id, "text", e.target.value);
                    }}
                    placeholder="Test Question (*)"
                    size="sm"
                  />

                  <Form.Control
                    as="textarea"
                    rows={2}
                    id={`param-${param.id}-tooltip`}
                    value={param.tooltip}
                    onChange={(e) => {
                      updateParam(param.id, "tooltip", e.target.value);
                    }}
                    placeholder="Tooltip / Guidance for the end user"
                    size="sm"
                  />
                </div>
                {index < params?.length - 1 && <hr className="my-4" />}
              </div>
            ))}
        </div>
      </Row>
    </>
  );
}

export default TestMethodAndParams;
