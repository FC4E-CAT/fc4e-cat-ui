/**
 * Component to display and edit a specific binary test
 */

// import { useState } from "react"
import { Button, Col, Form, Row } from "react-bootstrap";
import { EvidenceURLS } from "./EvidenceURLS";
import { AssessmentTest, EvidenceURL, TestBinary } from "@/types";
import { FaRegQuestionCircle } from "react-icons/fa";

interface AssessmentTestProps {
  test: TestBinary;
  principleId: string;
  criterionId: string;
  handleGuide(id: string, title: string, text: string): void;
  onTestChange(
    principleId: string,
    criterionId: string,
    newTest: AssessmentTest,
  ): void;
}

export const TestBinaryForm = (props: AssessmentTestProps) => {
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

  return (
    <div>
      <Row>
        <Col>
          <h6>
            <small className="text-muted badge badge-pill border bg-light">
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
        <Col xs={3} className="text-start"></Col>
      </Row>

      <Row>
        <Col>
          <div className="">
            <Form className="form-binary-test" onSubmit={() => false}>
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
              {/* here ends the binary test */}
            </Form>
          </div>

          {props.test.evidence_url !== undefined && (
            <EvidenceURLS
              urls={props.test.evidence_url}
              onListChange={onURLChange}
            />
          )}
        </Col>
      </Row>
    </div>
  );
};
