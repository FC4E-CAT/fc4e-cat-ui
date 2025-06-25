/**
 * Component to display a specific auto validation test for the g069 case
 */

// import { useState } from "react"
import { Button, Col, Row } from "react-bootstrap";

import { AutoGroupTest, TestAutoValidation } from "@/types";
import { FaPlay } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { FaGears } from "react-icons/fa6";
import { AutoTestDetails } from "./AutoTestDetails";

interface AssessmentTestProps {
  autogroup: AutoGroupTest | undefined;
  test: TestAutoValidation;
  onAutoGroupTestCall(autogroup: AutoGroupTest): void;
}

export const TestAutoValidationForm = (props: AssessmentTestProps) => {
  const { t } = useTranslation();

  // break parameters
  const textParams = props.test.text.split("|");

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
        <div>
          <h5>{textParams[0]}</h5>
          <div className="mb-2">
            <span className="me-2">Validation Result:</span>
            {props.test.result === null ? (
              <>
                <span className="badge badge-sm bg-secondary">UNKNOWN</span>
                <small className="ms-2">
                  - Please run the group test for result
                </small>
              </>
            ) : props.test.result === 1 ? (
              <>
                <span className="badge badge-sm bg-success">PASS</span>
              </>
            ) : (
              <>
                <span className="badge badge-sm bg-danger">FAIL</span>
              </>
            )}
          </div>

          <div className="mt-1 d-flex d-flex justify-content-between border rounded bg-light">
            <div className="p-2">
              <FaGears size="1.2rem" className="me-2 text-muted" />
              <small>
                This test is part of the test group:{" "}
                <code className="text-success">{props.test.type}</code>
              </small>
            </div>
            <Button
              variant="success"
              onClick={() => {
                if (props.autogroup) {
                  props.onAutoGroupTestCall(props.autogroup);
                }
              }}
            >
              <FaPlay className="me-2" />
              {` ${t("buttons.run_test_group")}`}
            </Button>
          </div>
        </div>
        <div className="mt-2">
          {props.test.last_run && (
            <AutoTestDetails details={props.test.last_run} />
          )}
        </div>
      </Row>
    </div>
  );
};
