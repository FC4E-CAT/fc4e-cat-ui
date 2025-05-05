/**
 * Component to display a specific auto validation test for the g069 case
 */

// import { useState } from "react"
import { Badge, Button, Col, Form, InputGroup, Row } from "react-bootstrap";
import { TestToolTip } from "./TestToolTip";
import {
  AssessmentTest,
  TestAutoError,
  TestAutoG069,
  TestAutoResponse,
} from "@/types";
import { FaClock, FaPlay } from "react-icons/fa";
import { APIClient } from "@/api";
import { useContext, useState } from "react";
import { AuthContext } from "@/auth";
import { AxiosError } from "axios";
import { useTranslation } from "react-i18next";
import { g069Providers } from "@/config";

interface AssessmentTestProps {
  test: TestAutoG069;
  principleId: string;
  criterionId: string;
  onTestChange(
    principleId: string,
    criterionId: string,
    newTest: AssessmentTest,
  ): void;
}

const providers: Record<string, string> = g069Providers;
export const TestAutoG069Form = (props: AssessmentTestProps) => {
  const { keycloak } = useContext(AuthContext)!;
  const { t } = useTranslation();

  const [localValue, setLocalValue] = useState(props.test.value || "");

  const [okStatus, setOkStatus] = useState<TestAutoResponse | null>(null);
  const [errStatus, setErrStatus] = useState<TestAutoError | null>(null);
  const [runningTest, setRunningTest] = useState(false);

  // break parameters
  const textParams = props.test.text.split("|");
  const tipParams = props.test.tool_tip.split("|");
  const testParams = props.test.params.split("|");

  // implement here the backend check and we'll organise the backend calls for automated checks in a seperate module
  function handleCheckG069(token: string) {
    // run the check

    setRunningTest(true);
    console.log(localValue);
    APIClient(token)
      .post<TestAutoResponse | TestAutoError>(
        `/v1/automated/aarc-g069`,
        `{"aai_provider_id": "${localValue}"}`,
        {
          validateStatus: (status) => status >= 200 && status < 500,
        },
      )
      .then((resp) => {
        if (resp.status === 200) {
          const okResp = resp.data as TestAutoResponse;
          const newTest = {
            ...props.test,
            value: localValue,
            result: okResp.test_status.is_valid ? 1 : 0,
          };
          props.onTestChange(props.principleId, props.criterionId, newTest);
          setOkStatus(okResp);
        } else {
          const errResp = resp.data as TestAutoError;
          const newTest = { ...props.test, value: localValue, result: -1 };
          props.onTestChange(props.principleId, props.criterionId, newTest);
          setErrStatus(errResp);
        }
      })
      .catch((error: AxiosError) => {
        console.log(error);
      })
      .finally(() => {
        setRunningTest(false);
      });
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
        <Col xs={3} className="text-start"></Col>
      </Row>

      <Row>
        <div>
          <h5>{textParams[0]}</h5>
          <InputGroup className="mt-1">
            <InputGroup.Text id="label-first-value">
              <TestToolTip
                tipId={"params-1-" + props.test.id}
                tipText={tipParams[0]}
              />
              <span className="ms-2">{testParams[0]}</span>:
            </InputGroup.Text>
            <Form.Select
              value={localValue || ""}
              id="input-value-control"
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                setLocalValue(e.target.value);
              }}
            >
              <option value="">Select a value</option>
              {Object.entries(providers).map(([label, value]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Form.Select>
            <Button
              variant="success"
              disabled={!localValue}
              onClick={() => {
                handleCheckG069(keycloak?.token || "");
              }}
            >
              <FaPlay className="me-2" />
              {` ${t("page_assessment_edit.run_check")}`}
            </Button>
          </InputGroup>
          {runningTest && (
            <div className="text-muted align-middle py-1">
              <FaClock className="me-2" />
              {t("page_assessment_edit.check_running")}
            </div>
          )}
          {!runningTest && okStatus !== null && (
            <>
              <div>{okStatus?.test_status.message}</div>
              <div>
                Validation:{" "}
                {okStatus?.test_status.is_valid ? (
                  <Badge bg="success">PASS</Badge>
                ) : (
                  <Badge bg="danger">FAIL</Badge>
                )}
                <div className="m-2">
                  <ul>
                    {Object.entries(okStatus.additional_info).map(
                      ([key, value]) => (
                        <li key={key}>
                          <small>
                            {value.message}:{" "}
                            {value.is_valid ? (
                              <Badge bg="success">PASS</Badge>
                            ) : (
                              <Badge bg="danger">FAIL</Badge>
                            )}
                          </small>
                        </li>
                      ),
                    )}
                  </ul>
                </div>
              </div>
            </>
          )}
          {!runningTest && setErrStatus !== null && (
            <div className="text-danger">{errStatus?.message}</div>
          )}
        </div>
      </Row>
    </div>
  );
};
