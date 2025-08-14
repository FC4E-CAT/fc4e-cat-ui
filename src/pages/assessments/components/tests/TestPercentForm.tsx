/**
 * Component to display and edit a percent value test
 */

import { Col, Form, InputGroup, Row } from "react-bootstrap";
import { EvidenceURLS } from "./EvidenceURLS";
import type { AssessmentTest, EvidenceURL, TestValueParam } from "@/types";
import { useState } from "react";
import { TestToolTip } from "./TestToolTip";
import { TestValueEventType } from "@/types/tests";

interface AssessmentTestProps {
  test: TestValueParam;
  principleId: string;
  criterionId: string;
  onTestChange(
    principleId: string,
    criterionId: string,
    newTest: AssessmentTest,
  ): void;
}

export const TestPercentForm = (props: AssessmentTestProps) => {
  const [localValue, setLocalValue] = useState<string>(
    props.test.value?.toString() || "",
  );

  const handleValueChange = (
    eventType: TestValueEventType,
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const newTest = { ...props.test };
    // keep only number digits as input
    const numberOnlyVal = event.target.value.replace(/[^0-9.]/g, "");

    if (eventType === TestValueEventType.Value) {
      // keep value between 0 and 100
      let val = parseInt(numberOnlyVal);
      if (isNaN(val)) val = -1;
      else if (val < 0) val = 0;
      else if (val > 100) val = 100;
      newTest.value = val;
      setLocalValue(val >= 0 ? val.toString() : "");
    }

    let comparisonMode = "";
    let comparisonValue = 0;
    let result: number | null = null;

    // find comparisonMode

    if (newTest.benchmark) {
      const modes = ["equal_greater_than", "equal_less_than", "equal"];

      for (const mode of modes) {
        if (mode in newTest.benchmark) {
          comparisonMode = mode;
          break;
        }
      }

      if (comparisonMode in newTest.benchmark) {
        if (typeof newTest.benchmark[comparisonMode] === "number") {
          comparisonValue = newTest.benchmark[comparisonMode] as number;
        } else if (
          newTest.benchmark[comparisonMode] === "threshold" &&
          newTest.threshold
        ) {
          comparisonValue = newTest.threshold;
        }
      }

      if (newTest.value !== null) {
        if (comparisonMode === "equal_greater_than") {
          result = newTest.value >= comparisonValue ? 1 : 0;
        } else if (comparisonMode === "equal_less_than") {
          result = newTest.value <= comparisonValue ? 1 : 0;
        } else {
          result = newTest.value === comparisonValue ? 1 : 0;
        }
      }
    } else {
      result = newTest.value;
    }
    newTest.result = result;
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
          {props.test.id && (
            <h6>
              <small className="text-muted badge badge-pill border bg-light m">
                {props.test.id && <span className="me-4">{props.test.id}</span>}
                {props.test.name}
              </small>
            </h6>
          )}
        </Col>
        <Col xs={1} className="text-start"></Col>
      </Row>

      <Row>
        <Col>
          <div>
            {textParams[0] && <h5>{textParams[0]}</h5>}
            <Row>
              <Col>
                <InputGroup>
                  <InputGroup.Text id="label-first-value">
                    {tipParams[0] && (
                      <TestToolTip
                        tipId={"params-1-" + props.test.id}
                        tipText={tipParams[0]}
                      />
                    )}
                    {testParams[0] && (
                      <span className="ms-2">{testParams[0]}</span>
                    )}
                    :
                  </InputGroup.Text>
                  <Form.Control
                    value={localValue}
                    type="text"
                    id="input-value-control"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      handleValueChange(TestValueEventType.Value, e);
                    }}
                  />
                  <InputGroup.Text id="label-percent">%</InputGroup.Text>
                </InputGroup>
              </Col>
              <Col>
                <div className="p-2">
                  <span>Please enter a number between 0 and 100</span>
                </div>
              </Col>
            </Row>
          </div>

          {(testParams[testParams.length - 1] === "evidence" ||
            testParams?.includes("evidence")) && (
            <div className="mt-1">
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
