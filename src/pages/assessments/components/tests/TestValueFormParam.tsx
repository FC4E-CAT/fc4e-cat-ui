/**
 * Component to display and edit a specific a value test
 */

// import { useState } from "react"
import { Alert, Col, Form, InputGroup, Row } from "react-bootstrap";
import { EvidenceURLS } from "./EvidenceURLS";
import { AssessmentTest, EvidenceURL, TestValueParam } from "@/types";
import { useState } from "react";
import { TestToolTip } from "./TestToolTip";
import { FaCogs } from "react-icons/fa";

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

enum TestValueEventType {
  Value = "value",
  Threshold = "threshold",
}

export const TestValueFormParam = (props: AssessmentTestProps) => {
  const [localValue, setLocalValue] = useState<string>(
    props.test.value?.toString() || "",
  );
  const [localThreshold, setLocalThreshold] = useState<string>(
    props.test.threshold?.toString() || "",
  );

  const handleValueChange = (
    eventType: TestValueEventType,
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const newTest = { ...props.test };
    // keep only number digits as input
    const numberOnlyVal = event.target.value.replace(/[^0-9.]/g, "");

    if (eventType === TestValueEventType.Value) {
      setLocalValue(numberOnlyVal);
      newTest.value = parseFloat(numberOnlyVal);
    } else {
      setLocalThreshold(numberOnlyVal);
      newTest.threshold = parseFloat(numberOnlyVal);
    }

    // evaluate result - benchmark till now supports only equal_greater_than
    // this will change in the future
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

      if (newTest.value) {
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
    console.log(result);
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

  // check if test is automated
  const automated = props.test.type.endsWith("Auto");

  return (
    <div>
      <Row>
        <Col>
          <h6>
            <small className="text-muted badge badge-pill border bg-light m">
              <span className="me-4">{props.test.id}</span>
              {props.test.name}
            </small>
          </h6>
        </Col>
        <Col xs={1} className="text-start"></Col>
      </Row>

      <Row>
        <Col>
          <div>
            <h5>{textParams[0]}</h5>
            {automated && (
              <Alert variant="warning">
                <div>
                  <FaCogs /> This test is meant to be automated{" "}
                  <em>(Work in progress...)</em>
                </div>
                <div>
                  <small>
                    For the time being you can fill in manually the{" "}
                    <code className="text-muted">responseVariable</code> value
                  </small>
                </div>
              </Alert>
            )}
            <Row>
              <InputGroup className="mt-1">
                <InputGroup.Text id="label-first-value">
                  <TestToolTip
                    tipId={"params-1-" + props.test.id}
                    tipText={tipParams[0]}
                  />
                  <span className="ms-2">{testParams[0]}</span>:
                </InputGroup.Text>
                <Form.Control
                  value={automated ? "" : localValue || ""}
                  type="text"
                  id="input-value-control"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    // use this input only if the test is not automated
                    if (!automated) {
                      handleValueChange(TestValueEventType.Value, e);
                    }
                  }}
                  disabled={automated}
                />
              </InputGroup>
            </Row>
            {testParams.length > 1 && testParams[1] !== "evidence" && (
              <>
                <Row className="mt-1">
                  <InputGroup className="mt-2">
                    <InputGroup.Text id="label-second-value">
                      <TestToolTip
                        tipId={"params-2-" + props.test.id}
                        tipText={tipParams[1]}
                      />
                      <span className="ms-2">{testParams[1]}</span>:
                    </InputGroup.Text>
                    <Form.Control
                      value={localThreshold || ""}
                      type="text"
                      id="input-value-community"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleValueChange(TestValueEventType.Threshold, e)
                      }
                      disabled={automated}
                    />
                  </InputGroup>
                </Row>
              </>
            )}
            {automated &&
              testParams.length > 2 &&
              testParams[2] !== "evidence" && (
                <>
                  <Row className="mt-1">
                    <InputGroup className="mt-2">
                      <InputGroup.Text id="label-second-value">
                        <TestToolTip
                          tipId={"params-3-" + props.test.id}
                          tipText={tipParams[2]}
                        />
                        <span className="ms-2">{testParams[2]}</span>:
                      </InputGroup.Text>
                      <Form.Control
                        value={localValue || ""}
                        type="text"
                        id="input-value-community"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          if (automated) {
                            handleValueChange(TestValueEventType.Value, e);
                          }
                        }}
                      />
                    </InputGroup>
                  </Row>
                </>
              )}
          </div>

          {testParams[testParams.length - 1] === "evidence" && (
            <EvidenceURLS
              urls={props.test.evidence_url || []}
              onListChange={onURLChange}
              noTitle={true}
            />
          )}
        </Col>
      </Row>
    </div>
  );
};
