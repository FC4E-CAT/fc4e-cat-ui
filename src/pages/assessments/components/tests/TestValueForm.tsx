/**
 * Component to display and edit a specific a value test
 */

// import { useState } from "react"
import { Button, Col, Form, Row } from "react-bootstrap";
import { EvidenceURLS } from "./EvidenceURLS";
import { AssessmentTest, TestValue } from "@/types";
import { useState } from "react";
import { FaCaretLeft, FaCaretRight, FaRegQuestionCircle } from "react-icons/fa";

interface AssessmentTestProps {
  test: TestValue;
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

export const TestValueForm = (props: AssessmentTestProps) => {
  const [showHelp, setShowHelp] = useState(false);

  const handleValueChange = (
    eventType: TestValueEventType,
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const newTest = { ...props.test };
    // keep only number digits as input
    const numberOnlyVal = event.target.value.replace(/[^0-9]/g, "");
    if (eventType === TestValueEventType.Value) {
      newTest.value = parseInt(numberOnlyVal);
    } else {
      newTest.threshold = parseInt(numberOnlyVal);
    }

    // evaluate result - benchmark till now supports only equal_greater_than
    // this will change in the future
    const comparisonMode = "equal_greater_than";
    let comparisonValue = 0;
    if (comparisonMode in newTest.benchmark) {
      if (typeof newTest.benchmark[comparisonMode] === "number") {
        comparisonValue = newTest.benchmark[comparisonMode];
      } else if (
        props.test.benchmark[comparisonMode] === "threshold" &&
        props.test.threshold
      ) {
        comparisonValue = props.test.threshold;
      }
    }
    let result: 0 | 1 | null = null;
    if (newTest.value) {
      result = newTest.value >= comparisonValue ? 1 : 0;
    }
    newTest.result = result;

    props.onTestChange(props.principleId, props.criterionId, newTest);
  };

  function onURLChange(newURLS: string[]) {
    const newTest = { ...props.test, evidence_url: newURLS };
    props.onTestChange(props.principleId, props.criterionId, newTest);
  }

  return (
    <div className="mt-4">
      <Row>
        <Col>
          <h6>
            Test {props.test.id}: {props.test.name}{" "}
          </h6>
        </Col>
        <Col xs={3} className="text-end">
          <Button
            className="mb-2"
            variant="light"
            size="sm"
            onClick={() => {
              setShowHelp(!showHelp);
            }}
          >
            {showHelp ? (
              <span>
                <FaCaretRight />
                <FaRegQuestionCircle />
              </span>
            ) : (
              <span>
                <FaCaretLeft />
                <FaRegQuestionCircle />
              </span>
            )}
          </Button>
        </Col>
      </Row>

      <Row>
        <Col>
          <Form>
            <div>
              <h5 className="mb-4">{props.test.text}</h5>
              <Row>
                <Col xs={1} className="text-right">
                  <span className="h5 me-4">
                    <strong>{props.test.value_name}: </strong>
                  </span>
                </Col>
                <Col xs={4}>
                  <Form.Control
                    value={props.test.value || ""}
                    type="text"
                    id="input-value-control"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleValueChange(TestValueEventType.Value, e)
                    }
                  />
                </Col>
              </Row>
              {props.test.threshold !== undefined && (
                <>
                  <Row className="mt-2">
                    <Col xs={1} className="text-right">
                      <span className="h5 me-4">
                        <strong>
                          {props.test.threshold_name || "Threshold"}:{" "}
                        </strong>
                      </span>
                    </Col>
                    <Col xs={4}>
                      <Form.Control
                        value={props.test.threshold || ""}
                        type="text"
                        id="input-value-community"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handleValueChange(TestValueEventType.Threshold, e)
                        }
                      />
                    </Col>
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

            <div className="text-muted mt-2 border-top align-right">
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
            </div>
          </Form>
        </Col>

        {/* Show guidance */}
        {showHelp && props.test.guidance && (
          <Col className="border-start px-4 mb-2 ms-2">
            <h3>Guidance {props.test.guidance.id}</h3>
            <p style={{ whiteSpace: "pre-line" }}>
              {props.test.guidance.description}
            </p>
          </Col>
        )}
      </Row>
    </div>
  );
};
