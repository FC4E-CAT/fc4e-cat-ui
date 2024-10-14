/**
 * Component to display and edit a specific binary test with parameters
 */

// import { useState } from "react"
import { Col, Form, Row } from "react-bootstrap";
import { EvidenceURLS } from "./EvidenceURLS";
import { TestToolTip } from "./TestToolTip";
import { AssessmentTest, EvidenceURL, TestBinaryParam } from "@/types";

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
  const textParams = props.test.text.split("|");
  const tipParams = props.test.tool_tip.split("|");
  const testParams = props.test.params.split("|");

  return (
    <div>
      <Row>
        <Col>
          <h6>
            <small className="text-muted badge badge-pill border bg-light">
              <span className="me-4">{props.test.id}</span>
              {props.test.name}
            </small>
          </h6>
        </Col>
        <Col xs={3} className="text-start"></Col>
      </Row>

      <Row>
        <Col>
          <div className="">
            <Form className="form-binary-test" onSubmit={() => false}>
              <h5>
                {textParams[0]}{" "}
                <TestToolTip
                  tipId={"text-" + props.test.id}
                  tipText={tipParams[0]}
                />
              </h5>

              <Form.Check
                inline
                label="Yes"
                value="1"
                name="test-input-group"
                type="radio"
                id="test-check-yes"
                checked={props.test.value === true}
                onChange={handleValueChange}
              />
              <Form.Check
                inline
                label="No"
                value="0"
                name="test-input-group"
                type="radio"
                id="test-check-no"
                checked={props.test.value === false}
                onChange={handleValueChange}
              />
              {/* here ends the binary test */}
            </Form>
          </div>

          {testParams[testParams.length - 1] === "evidence" && (
            <div className="mt-2">
              <h6>
                {textParams[1]}{" "}
                <TestToolTip
                  tipId={"evidence-" + props.test.id}
                  tipText={tipParams[1]}
                />
              </h6>
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
  );
};
