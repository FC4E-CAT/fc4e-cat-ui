/**
 * Component to display and edit a specific binary test
 */

// import { useState } from "react"
import { Button, Col, Form, Row } from "react-bootstrap";
import { EvidenceURLS } from "./EvidenceURLS";
import { AssessmentTest, TestBinary } from "@/types";
import { useState } from "react";
import { FaCaretLeft, FaCaretRight, FaRegQuestionCircle } from "react-icons/fa";

interface AssessmentTestProps {
  test: TestBinary;
  principleId: string;
  criterionId: string;
  onTestChange(
    principleId: string,
    criterionId: string,
    newTest: AssessmentTest,
  ): void;
}

export const TestBinaryForm = (props: AssessmentTestProps) => {
  const [showHelp, setShowHelp] = useState(false);

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

  function onURLChange(newURLS: string[]) {
    const newTest = { ...props.test, evidence_url: newURLS };
    props.onTestChange(props.principleId, props.criterionId, newTest);
  }

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
            <div className="">
              <h5>{props.test.text}</h5>
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
            </div>

            {props.test.evidence_url !== undefined && (
              <EvidenceURLS
                urls={props.test.evidence_url}
                onListChange={onURLChange}
              />
            )}
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
