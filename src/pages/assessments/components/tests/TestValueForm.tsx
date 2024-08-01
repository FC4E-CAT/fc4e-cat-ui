/**
 * Component to display and edit a specific a value test
 */

// import { useState } from "react"
import {
  Button,
  Col,
  Form,
  InputGroup,
  OverlayTrigger,
  Row,
  Tooltip,
} from "react-bootstrap";
import { EvidenceURLS } from "./EvidenceURLS";
import { AssessmentTest, TestValue } from "@/types";
import { FaLock, FaRegQuestionCircle } from "react-icons/fa";
import { useState } from "react";

interface AssessmentTestProps {
  test: TestValue;
  principleId: string;
  criterionId: string;
  handleGuide(id: string, title: string, text: string): void;
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

export const TestValueForm = (props: AssessmentTestProps) => {
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

    // find comparisonMode
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

    let result: 0 | 1 | null = null;

    if (newTest.value) {
      if (comparisonMode === "equal_greater_than") {
        result = newTest.value >= comparisonValue ? 1 : 0;
      } else if (comparisonMode === "equal_less_than") {
        result = newTest.value <= comparisonValue ? 1 : 0;
      } else {
        result = newTest.value === comparisonValue ? 1 : 0;
      }
    }
    newTest.result = result;

    props.onTestChange(props.principleId, props.criterionId, newTest);
  };

  function onURLChange(newURLS: string[]) {
    const newTest = { ...props.test, evidence_url: newURLS };
    props.onTestChange(props.principleId, props.criterionId, newTest);
  }

  return (
    <div>
      <Row>
        <Col>
          <h6>
            <small className="text-muted badge badge-pill border bg-light m">
              <span className="me-4">{props.test.id}</span>
              {props.test.name}
            </small>
            <Button
              className="ms-2"
              variant="light"
              size="sm"
              onClick={() => {
                //setShowHelp(!showHelp);
                props.handleGuide(
                  props.test.id + props.test.guidance?.id || " ",
                  "Guidance " + props.test.guidance?.id || "",
                  props.test.guidance?.description || "No guidance Available",
                );
              }}
            >
              <span>
                <FaRegQuestionCircle />
              </span>
            </Button>
          </h6>
        </Col>
        <Col xs={1} className="text-start"></Col>
      </Row>

      <Row>
        <Col>
          <div>
            <h5>{props.test.text}</h5>
            <Row>
              <InputGroup className="mt-1">
                <InputGroup.Text id="label-first-value">
                  {props.test.value_name}:
                </InputGroup.Text>
                <Form.Control
                  value={localValue || ""}
                  type="text"
                  id="input-value-control"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleValueChange(TestValueEventType.Value, e)
                  }
                />
              </InputGroup>
            </Row>
            {props.test.threshold !== undefined && (
              <>
                <Row className="mt-1">
                  <InputGroup className="mt-2">
                    <InputGroup.Text id="label-second-value">
                      {props.test.threshold_name || "Threshold"}:{" "}
                    </InputGroup.Text>
                    <Form.Control
                      value={localThreshold || ""}
                      type="text"
                      id="input-value-community"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleValueChange(TestValueEventType.Threshold, e)
                      }
                      disabled={props.test.threshold_locked}
                    />
                    {props.test.threshold_locked && (
                      <OverlayTrigger
                        key="top"
                        placement="top"
                        overlay={
                          <Tooltip id={`tooltip-top`}>
                            This threshold is predefined (non-editable)
                          </Tooltip>
                        }
                      >
                        <InputGroup.Text id="label-second-value">
                          <FaLock />
                        </InputGroup.Text>
                      </OverlayTrigger>
                    )}
                  </InputGroup>
                </Row>
              </>
            )}
          </div>

          {props.test.evidence_url !== undefined && (
            <EvidenceURLS
              urls={props.test.evidence_url}
              onListChange={onURLChange}
            />
          )}

          {/* <div className="text-muted mt-2 border-top align-right">
              <small>
                <em>Test Result: </em>
                {props.test.result !== null ? (
                  <strong>{props.test.result}</strong>
                ) : (
                  <span>
                    <strong>Unknown</strong> - Please enter value(s) above
                  </span>
                )}
              </small>
            </div> */}
        </Col>
      </Row>
    </div>
  );
};
