/**
 * Component to display and edit a specific binary test with parameters
 */

import { Form, Row, Col } from "react-bootstrap";
import { EvidenceURLS } from "./EvidenceURLS";
import { TestToolTip } from "./TestToolTip";
import { AssessmentTest, EvidenceURL, TestBinaryParam } from "@/types";
import { useTranslation } from "react-i18next";

interface AssessmentTestProps {
  test: TestBinaryParam;
  principleId: string;
  criterionId: string;
  onTestChange(
    principleId: string,
    criterionId: string,
    newTest: AssessmentTest,
  ): void;
}

export const TestBinaryParamForm = (props: AssessmentTestProps) => {
  const { t } = useTranslation();
  const handleValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let result: 0 | 1 = 0;
    let value: boolean = false;
    if (event.target.value === "1") {
      value = true;
      result = 1;
    }
    const newTest = { ...props.test, result: result, value: value };

    props.onTestChange(props.principleId, props.criterionId, newTest);
  };

  function onURLChange(newURLS: EvidenceURL[]) {
    const newTest = { ...props.test, evidence_url: newURLS };
    props.onTestChange(props.principleId, props.criterionId, newTest);
  }

  // break parameters
  const testDescription = props.test?.description;
  const textParams = props.test.text?.split("|");
  const tipParams = props.test.tool_tip?.split("|");
  const testParams = props.test.params?.split("|");

  return (
    <div>
      <Row>
        <div style={{ width: "75%" }}>
          {props.test?.name && (
            <div className="flex items-center gap-2">
              <span className="cat-test-title ">
                <span className="">{props.test.id}</span> / {props.test.name}
                <span className="mt-2 p-2  fs-6">
                  <TestToolTip
                    tipId={"text-" + props.test.id}
                    tipText={testDescription || ""}
                  />
                </span>
              </span>
            </div>
          )}
        </div>
      </Row>
      <Row className="d-flex justify-content-between">
        <div style={{ width: "70%", wordBreak: "break-word" }}>
          {textParams?.[0] && (
            <p className="mt-1 pe-4 fw-light fs-6 ">
              {textParams[0]}{" "}
              <span className="mt-2 p-2  fs-6">
                <TestToolTip
                  tipId={"text-" + props.test.id}
                  tipText={tipParams[0]}
                />
              </span>
            </p>
          )}
        </div>

        <div style={{ width: "30%" }}>
          {textParams?.[0] && (
            <Form className="form-binary-test" onSubmit={() => false}>
              <Form.Check
                inline
                label={t("fields.yes")}
                value="1"
                name="test-input-group"
                type="radio"
                id="test-check-yes"
                className="fs-6 fw-bold  text-secondary"
                checked={props.test.value === true}
                onChange={handleValueChange}
              />
              <Form.Check
                inline
                label={t("fields.no")}
                value="0"
                name="test-input-group"
                type="radio"
                className="fs-6 fw-bold  text-secondary"
                id="test-check-no"
                checked={props.test.value === false}
                onChange={handleValueChange}
              />
              {/* here ends the binary test */}
            </Form>
          )}
        </div>
      </Row>
      <div>
        <Row>
          <Col>
            {testParams[testParams.length - 1] === "evidence" && (
              <div className="mt-2">
                <span className="fw-light-500 text-sm text-secondary">
                  <strong>{textParams[textParams?.length - 1]}</strong>
                  <TestToolTip
                    tipId={"evidence-" + props.test.id}
                    tipText={tipParams[tipParams?.length - 1]}
                  />
                </span>
                <EvidenceURLS
                  urls={props.test.evidence_url || []}
                  onListChange={onURLChange}
                  noTitle={true}
                />
              </div>
            )}
          </Col>
        </Row>
      </div>
    </div>
  );
};
