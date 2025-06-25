/**
 * Component to display and edit a specific auto https check
 */

// import { useState } from "react"
import { Button, Col, Form, InputGroup, Row } from "react-bootstrap";
import { EvidenceURLS } from "./EvidenceURLS";
import { TestToolTip } from "./TestToolTip";
import {
  AssessmentTest,
  EvidenceURL,
  HttpTestResponse,
  TestAutoHttpsCheck,
} from "@/types";
import { FaCheckCircle, FaClock, FaPlay, FaTimes } from "react-icons/fa";
import { APIClient } from "@/api";
import { useContext, useState } from "react";
import { AuthContext } from "@/auth";
import { AxiosError } from "axios";
import { useTranslation } from "react-i18next";
import { AutoTestDetails } from "./AutoTestDetails";

interface AssessmentTestProps {
  test: TestAutoHttpsCheck;
  principleId: string;
  criterionId: string;
  onTestChange(
    principleId: string,
    criterionId: string,
    newTest: AssessmentTest,
  ): void;
}

export const TestAutoHttpsCheckForm = (props: AssessmentTestProps) => {
  const { keycloak } = useContext(AuthContext)!;
  const { t } = useTranslation();

  function onURLChange(newURLS: EvidenceURL[]) {
    const newTest = { ...props.test, evidence_url: newURLS };
    props.onTestChange(props.principleId, props.criterionId, newTest);
  }
  const [localValue, setLocalValue] = useState(props.test.value);
  const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;
  const validUrl = urlRegex.test(localValue || "");

  const [runningTest, setRunningTest] = useState(false);

  // break parameters
  const textParams = props.test.text.split("|");
  const tipParams = props.test.tool_tip.split("|");
  const testParams = props.test.params.split("|");

  // implement here the backend check and we'll organise the backend calls for automated checks in a seperate module
  function handleHttpsCheck(token: string) {
    // run the check
    setRunningTest(true);
    APIClient(token)
      .post<HttpTestResponse>(
        `/v1/automated/check-url`,
        `{"url": "${localValue}"}`,
        {
          validateStatus: (status) => status >= 200 && status < 500,
        },
      )
      .then((resp) => {
        if (resp.data.code === 200 && resp.data.is_valid_https !== undefined) {
          const newTest = {
            ...props.test,
            value: localValue,
            result: resp.data.is_valid_https ? 1 : 0,
            last_run: {
              timestamp: new Date().toISOString(),
              message: resp.data.message || "",
              code: resp.data.code,
            },
          };
          props.onTestChange(props.principleId, props.criterionId, newTest);
        } else {
          const newTest = {
            ...props.test,
            value: localValue,
            result: 0,
            last_run: {
              timestamp: new Date().toISOString(),
              message: resp.data.message || "",
              code: resp.data.code,
            },
          };
          props.onTestChange(props.principleId, props.criterionId, newTest);
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
          {props.test.id && (
            <h6>
              <small className="text-muted badge badge-pill border bg-light">
                {props.test.id && <span className="me-4">{props.test.id}</span>}
                {props.test.name}
              </small>
            </h6>
          )}
        </Col>
        <Col xs={3} className="text-start"></Col>
      </Row>

      <Row>
        <div>
          {textParams[0] && <h5>{textParams[0]}</h5>}
          <InputGroup className="mt-1">
            <InputGroup.Text id="label-first-value">
              {tipParams[0] && (
                <TestToolTip
                  tipId={"params-1-" + props.test.id}
                  tipText={tipParams[0]}
                />
              )}
              {testParams[0] && <span className="ms-2">{testParams[0]}</span>}:
            </InputGroup.Text>
            <Form.Control
              value={localValue || ""}
              type="text"
              id="input-value-control"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setLocalValue(e.target.value);
              }}
            />
            <Button
              variant="success"
              disabled={!validUrl}
              onClick={() => {
                handleHttpsCheck(keycloak?.token || "");
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
          {!runningTest && !validUrl && (
            <div>
              <small className="text-danger">
                {t("page_assessment_edit.err_evidence")}
              </small>
            </div>
          )}
          {!runningTest &&
            props.test.result !== null &&
            props.test.value === localValue && (
              <div>
                {props.test.result > 0 ? (
                  <small className="text-success">
                    <FaCheckCircle className="me-2" />
                    {t("page_assessment_edit.valid_https")}
                  </small>
                ) : (
                  <small className="text-danger">
                    <FaTimes className="me-2" />
                    {t("page_assessment_edit.invalid_https")}
                  </small>
                )}
              </div>
            )}
        </div>

        {testParams[testParams.length - 1] === "evidence" && (
          <div className="mt-2">
            <h6>
              {textParams[1] && textParams[1]}{" "}
              {tipParams[1] && (
                <TestToolTip
                  tipId={"evidence-" + props.test.id}
                  tipText={tipParams[1]}
                />
              )}
            </h6>
            <EvidenceURLS
              urls={props.test.evidence_url || []}
              onListChange={onURLChange}
              noTitle={true}
            />
          </div>
        )}
        <div className="mt-2">
          {props.test.last_run && (
            <AutoTestDetails details={props.test.last_run} />
          )}
        </div>
      </Row>
    </div>
  );
};
