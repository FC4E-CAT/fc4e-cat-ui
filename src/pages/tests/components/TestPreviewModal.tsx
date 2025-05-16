import React from "react";
import { Button, Form, InputGroup } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { TestDefinitionInput, TestHeaderInput, TestParam } from "@/types/tests";
import { EvidenceURLS, TestToolTip } from "@/pages/assessments/components";

interface TestPreviewProps {
  testHeader: TestHeaderInput;
  testDefinition?: TestDefinitionInput;
  params: TestParam[];
  testMethodName?: string;
  hasEvidenceParam?: boolean;
}

const TestPreviewModal: React.FC<TestPreviewProps> = ({
  testHeader,
  testDefinition,
  params,
  testMethodName,
  hasEvidenceParam,
}) => {
  const { t } = useTranslation();

  // Determine the test type based on the test_method_id
  const getTestType = (): string => {
    if (!testDefinition?.test_method_id) return "binary"; // Default type

    // Map test_method_id to test type based on the method name
    const methodName = testMethodName?.toLowerCase() || "";
    if (methodName.includes("auto-check-url")) return "Auto-Check-Url-Binary";
    if (methodName.includes("auto-check-string"))
      return "Auto-Check-String-Binary";
    if (methodName.includes("auto-check-xml-md1")) {
      if (methodName.includes("md1a")) return "Auto-Check-Xml-MD1a";
      if (methodName.includes("md1b1")) return "Auto-Check-Xml-MD1b1";
      return "Auto-Check-Xml-MD1b2";
    }
    if (methodName.includes("value")) return "value";
    if (methodName.includes("string")) {
      return "Number-Manual";
    }
    if (methodName.includes("number")) return "Number-Manual";
    if (methodName.includes("ratio")) return "Ratio-Manual";
    if (methodName.includes("percent")) return "Percent-Manual";
    if (methodName.includes("trl")) return "TRL-Manual";
    if (methodName.includes("years")) return "Years-Manual";

    return "binary";
  };

  const renderParams = () => {
    const testType = getTestType();

    if (
      [
        "value",
        "Number-Manual",
        "Number-Auto",
        "Ratio-Manual",
        "Percent-Manual",
        "TRL-Manual",
        "Years-Manual",
      ].includes(testType)
    ) {
      return (
        <div className="mb-2">
          {params.map((param, index) => (
            <div key={index} className="border p-2 rounded mb-2 bg-light">
              <div>
                <strong className="me-2">
                  {param.text || t("{Test Question}")}{" "}
                  {param?.tooltip && (
                    <span style={{ height: "35px", alignSelf: "start" }}>
                      <TestToolTip
                        tipId={"text-" + param.id}
                        tipText={param.tooltip}
                      />
                    </span>
                  )}
                </strong>
              </div>
              <div className="mt-2">
                {testType === "TRL-Manual" ? (
                  <Form.Select
                    disabled
                    aria-label="TRL Selection"
                    className="form-control-sm"
                  >
                    <option>{t("Select TRL level")}</option>
                  </Form.Select>
                ) : testType === "Ratio-Manual" ? (
                  <div className="d-flex align-items-center">
                    <Form.Control
                      type="text"
                      disabled
                      placeholder="0"
                      size="sm"
                      className="me-2"
                    />
                  </div>
                ) : testType === "Percent-Manual" ? (
                  <div className="d-flex align-items-center">
                    <Form.Control
                      type="text"
                      disabled
                      placeholder="0"
                      size="sm"
                      className="me-2"
                    />
                    <span>%</span>
                  </div>
                ) : testType === "Years-Manual" ? (
                  <div className="d-flex align-items-center">
                    <Form.Control
                      type="text"
                      disabled
                      placeholder="0"
                      size="sm"
                      className="me-2"
                    />
                    <span>{t("years")}</span>
                  </div>
                ) : (
                  <Form.Control
                    type="text"
                    disabled
                    placeholder="0"
                    size="sm"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      );
    } else if (
      [
        "Auto-Check-Url-Binary",
        "Auto-Check-String-Binary",
        "Auto-Check-Xml-MD1a",
        "Auto-Check-Xml-MD1b1",
        "Auto-Check-Xml-MD1b2",
      ].includes(testType)
    ) {
      return (
        <div className="mb-2">
          {params.map((param, index) => (
            <div key={index} className="border p-2 rounded mb-2 bg-light">
              <div>
                <strong className="me-2">
                  {param.text || t("{Test Question}")}{" "}
                  {param?.tooltip &&
                    !(
                      testType === "Auto-Check-Url-Binary" ||
                      testType === "Auto-Check-String-Binary"
                    ) && (
                      <TestToolTip
                        tipId={"text-" + param.id}
                        tipText={param.tooltip}
                      />
                    )}
                </strong>
              </div>
              {testType === "Auto-Check-Url-Binary" ? (
                <>
                  <InputGroup className="mt-1">
                    <InputGroup.Text id={`label-${param.id}`}>
                      <TestToolTip
                        tipId={`params-${index}-${param.id}`}
                        tipText={param?.tooltip || ""}
                      />
                      <span className="ms-2">{param.name}</span>:
                    </InputGroup.Text>
                    <Form.Control
                      placeholder={t("https://example.com")}
                      aria-label={t("Enter URL")}
                      disabled
                    />
                    <Button
                      variant="success"
                      disabled
                      className="d-flex align-items-center"
                    >
                      <span className="me-1">▶</span>
                      {t("page_assessment_edit.run_check")}
                    </Button>
                  </InputGroup>
                  <div className="mt-2">
                    <small className="text-muted">
                      {t("page_assessment_edit.status_message_placeholder")}
                    </small>
                  </div>
                </>
              ) : testType === "Auto-Check-String-Binary" ? (
                <>
                  <InputGroup className="mt-1">
                    <InputGroup.Text id={`label-${param.id}`}>
                      <TestToolTip
                        tipId={`params-${index}-${param.id}`}
                        tipText={param?.tooltip || ""}
                      />
                      <span className="ms-2">{param.name}</span>:
                    </InputGroup.Text>
                    <Form.Select>
                      <option value="">Select a value</option>
                      <option value="provider1">Provider 1</option>
                      <option value="provider2">Provider 2</option>
                      <option value="provider3">Provider 3</option>
                    </Form.Select>
                    <Button
                      variant="success"
                      disabled
                      className="d-flex align-items-center"
                    >
                      <span className="me-1">▶</span>
                      {t("page_assessment_edit.run_check")}
                    </Button>
                  </InputGroup>
                  <div className="mt-3">
                    <div>
                      {t("Validation")}
                      {": "}
                      <span className="badge bg-secondary">{t("Pending")}</span>
                    </div>
                    <div className="mt-2">
                      <ul className="mb-0">
                        <li>
                          <small>
                            {t("Check item 1")}
                            {": "}
                            <span className="badge bg-secondary">
                              {t("Pending")}
                            </span>
                          </small>
                        </li>
                        <li>
                          <small>
                            {t("Check item 2")}
                            {": "}
                            <span className="badge bg-secondary">
                              {t("Pending")}
                            </span>
                          </small>
                        </li>
                      </ul>
                    </div>
                  </div>
                </>
              ) : (
                <InputGroup className="mt-2" size="sm">
                  <Form.Control
                    placeholder={
                      testType.includes("URL")
                        ? t("Enter URL")
                        : t("Enter value")
                    }
                    disabled
                  />
                  <InputGroup.Text>
                    <span className="text-muted">{t("Run")}</span>
                  </InputGroup.Text>
                </InputGroup>
              )}
            </div>
          ))}
        </div>
      );
    } else {
      return (
        <div className="mb-2">
          {params.map((param, index) => (
            <div key={index} className="border p-2 rounded mb-2 bg-light">
              <div className="d-flex align-items-center">
                <strong>
                  {param.text || t("{Question}")}{" "}
                  {param?.tooltip && (
                    <span className="">
                      <TestToolTip
                        tipId={"text-" + param.id}
                        tipText={param.tooltip}
                      />
                    </span>
                  )}
                </strong>
              </div>
              <div className="d-flex gap-3 mt-2">
                <Form.Check disabled label={t("Yes")} type="radio" />
                <Form.Check disabled label={t("No")} type="radio" />
              </div>
            </div>
          ))}
        </div>
      );
    }
  };

  return (
    <div
      className="mt-1"
      style={{ borderRadius: 0, border: "none", wordBreak: "break-word" }}
    >
      <div className="text-black">
        <h4 className="mb-2">Test Preview</h4>
      </div>
      <div>
        <div className="p-2 ps-0">
          <div className="d-flex align-items-start mb-3">
            <div>
              <h5>
                {testHeader.tes || t("{TES Name placeholder}")} -{" "}
                {testHeader.label || t("{Test Label placeholder}")}
              </h5>
              <p className="text-muted mb-2">
                {testHeader.description || t("{Test Description placeholder}")}
              </p>
              {testMethodName && (
                <span className="badge bg-secondary me-1">
                  {testMethodName}
                </span>
              )}
            </div>
          </div>
          {hasEvidenceParam && (
            <div className="mb-3">
              <span className="d-flex align-items-center gap-1">
                Provide evidence of that via a URL to a page or to a
                documentation
                <TestToolTip
                  tipId="evidence-id"
                  tipText="A document, web page, or publication describing provisions"
                />
              </span>
              <EvidenceURLS
                isPreviewMode
                urls={[]}
                onListChange={() => {}}
                noTitle
              />
            </div>
          )}
          <div className="mb-2">
            {params.length > 0 ? (
              renderParams()
            ) : (
              <p className="text-muted">{t("No parameters defined yet")}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPreviewModal;
