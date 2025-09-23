import {
  Modal,
  Button,
  ListGroup,
  ListGroupItem,
  Alert,
} from "react-bootstrap";
import { useTranslation } from "react-i18next";
import type {
  AdditionalInfoItem,
  Assessment,
  AutoGroupTest,
  GroupTestParam,
  GroupTestRef,
  LastRun,
  TestAutoError,
  TestAutoResponse,
} from "@/types";
import { useContext, useEffect, useState } from "react";
import { FaCircle } from "react-icons/fa6";
import {
  FaCheckCircle,
  FaClock,
  FaInfoCircle,
  FaPlay,
  FaPlayCircle,
  FaTimesCircle,
} from "react-icons/fa";
import { APIClient } from "@/api";
import { AxiosError } from "axios";
import { applyAutoGroupResults, queryValue } from "@/utils";
import { AuthContext } from "@/auth";
import { AutoTestDetails } from "./AutoTestDetails";

interface GroupTestModalProps {
  groupTest: AutoGroupTest | null;
  assessment?: Assessment;
  show: boolean;
  onHide: () => void;
  onUpdateResults: (assessment: Assessment) => void;
}
/**
 * Modal component for executing a group of tests
 */

function initParams(asmt: Assessment, params: GroupTestParam[]) {
  const result: Record<string, string> = {};

  params.map((param) => {
    let value = "";
    if (param.value) value = param.value;
    else if (param.assessment_ref)
      value = queryValue(asmt, param.assessment_ref) as string;
    result[param.name] = value;
  });
  return result;
}

function initGroupTests(
  asmt: Assessment,
  testMethod: string,
): Record<string, GroupTestRef> {
  const groupTests: Record<string, GroupTestRef> = {};

  asmt.principles.map((pri) => {
    pri.criteria.map((cri) => {
      cri.metric.tests.map((test) => {
        if (test.type === testMethod) {
          groupTests[test.params] = {
            criterionId: cri.id,
            criterionName: cri.name,
            criterionImperative: cri.imperative,
            testId: test.id,
            testName: test.name,
            result: test.result,
            last_run: { message: "", timestamp: "", code: 0 },
          };
        }
      });
    });
  });

  return groupTests;
}

export function GroupTestModal(props: GroupTestModalProps) {
  const { keycloak } = useContext(AuthContext)!;
  const { t } = useTranslation();

  const [groupTests, setGroupTests] = useState<Record<string, GroupTestRef>>(
    {},
  );
  const [runningTest, setRunningTest] = useState(false);
  const [params, setParams] = useState<Record<string, string>>({});
  const [error, setError] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [execTime, setExecTime] = useState<string>("");

  function handleResults(
    info: Record<string, AdditionalInfoItem> | null,
    lastRun: LastRun,
  ) {
    const groupTestsUpdate: Record<string, GroupTestRef> | null = info
      ? {}
      : null;

    if (info && groupTestsUpdate) {
      Object.keys(info).map((key) => {
        // update groupTest object that will apply changes to the assessment
        groupTestsUpdate[key] = {
          ...groupTests[key],
          ["result"]: info[key].is_valid ? 1 : 0,
          ["last_run"]: {
            timestamp: lastRun.timestamp,
            code: lastRun.code,
            message: info[key].message,
          },
        };
      });
    }

    // apply result changes to the assessment
    if (props.assessment && props.groupTest) {
      const assessmentUpdated = applyAutoGroupResults(
        props.assessment,
        props.groupTest?.test_method,
        groupTestsUpdate,
        lastRun,
      );

      if (assessmentUpdated) {
        props.onUpdateResults(assessmentUpdated);
      }
    }
  }

  function handleRunTestGroup(token: string) {
    // run the check
    setRunningTest(true);

    APIClient(token)
      .post<TestAutoResponse | TestAutoError>(
        props.groupTest?.endpoint || "",
        params,
        {
          validateStatus: (status) => status >= 200 && status < 500,
        },
      )
      .then((resp) => {
        if (resp.status === 200) {
          const okResp = resp.data as TestAutoResponse;
          setMessage(okResp.test_status.message || "");
          setExecTime(new Date().toISOString() || "");

          const lastRunInfo = {
            code: okResp.test_status.code,
            timestamp: new Date().toISOString(),
            message: okResp.test_status.message,
          };
          // handle params
          handleResults(okResp.additional_info, lastRunInfo);
        } else {
          const errResp = resp.data as TestAutoError;

          const now = new Date().toISOString();
          const lastRunInfo = {
            code: errResp.code,
            timestamp: now,
            message: errResp.message,
          };
          setError(errResp.message || "");
          setExecTime(now);
          // params empty - update only last run info on tests and clear
          handleResults(null, lastRunInfo);
        }
      })
      .catch((error: AxiosError) => {
        console.log(error);
      })
      .finally(() => {
        setRunningTest(false);
      });
  }

  useEffect(() => {
    setRunningTest(false);
    if (props.show && props.assessment && props.groupTest) {
      setGroupTests(
        initGroupTests(props.assessment, props.groupTest.test_method),
      );
      setParams(initParams(props.assessment, props.groupTest.params));
    } else {
      setGroupTests({});
      setParams({});
      setMessage("");
      setError("");
      setExecTime("");
    }
  }, [props.show, props.assessment, props.groupTest]);

  return (
    <Modal
      show={props.show}
      onHide={props.onHide}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title
          className="d-flex align-items-center gap-1"
          id="contained-modal-title-vcenter"
        >
          {t("Automated Group")}
          {": "}
          {props.groupTest?.test_method}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>{t("test_group_contains")}:</p>
        <ListGroup className="mb-2">
          <div>
            {Object.keys(groupTests).map((key) => {
              const item = groupTests[key];
              return (
                <ListGroupItem key={key}>
                  <div className="text-secondary">
                    <small>{item.criterionId}</small>
                    <small className="ms-2">
                      <strong>{item.criterionName}</strong>
                    </small>
                    {item.criterionImperative.toLowerCase() === "must" ? (
                      <small className="ms-2 badge badge-sm bg-light border text-secondary">
                        {t("required")}
                      </small>
                    ) : null}
                  </div>
                  <div className="d-flex d-flex justify-content-between">
                    <div>
                      <span>{item.testId}</span>
                      <strong className="ms-2">{item.testName}</strong>
                    </div>
                    <div>
                      {item.result !== null ? (
                        item.result ? (
                          <FaCheckCircle className="text-success" />
                        ) : (
                          <FaTimesCircle className="text-danger" />
                        )
                      ) : (
                        <FaCircle className="text-secondary" />
                      )}
                    </div>
                  </div>
                  {item.last_run &&
                    item.last_run.message &&
                    item.last_run.timestamp && (
                      <AutoTestDetails details={item.last_run} />
                    )}
                </ListGroupItem>
              );
            })}
          </div>
        </ListGroup>
        {runningTest ? (
          <Alert variant="warning" className="py-1">
            <FaPlayCircle className="me-2" />
            {t("running_test_group")}
          </Alert>
        ) : (
          <div>
            {!error && !message && (
              <Alert variant="warning" className="py-1">
                <FaInfoCircle className="me-2" />
                {t("test_group_run")}
              </Alert>
            )}
            {error && (
              <Alert variant="danger" className="py-1">
                <FaTimesCircle className="me-2" />
                {error}
                {execTime && (
                  <div>
                    <em>
                      <small>{`last run: ${execTime}`}</small>
                    </em>
                  </div>
                )}
              </Alert>
            )}
            {message && (
              <Alert variant="success" className="py-1">
                <FaCheckCircle className="me-2" />
                {message}
                {execTime && (
                  <div>
                    <em>
                      <small>{`last run: ${execTime}`}</small>
                    </em>
                  </div>
                )}
              </Alert>
            )}
          </div>
        )}
      </Modal.Body>
      <Modal.Footer className="d-flex justify-content-between">
        <Button className="btn-secondary" onClick={props.onHide}>
          {t("buttons.close")}
        </Button>
        {runningTest ? (
          <Button className="btn-secondary" disabled>
            <FaClock />
            <span className="ms-2">{t("buttons.running_test_group")}</span>
          </Button>
        ) : (
          <Button
            className="btn-success"
            onClick={() => {
              handleRunTestGroup(keycloak?.token || "");
            }}
            disabled={runningTest}
          >
            <FaPlay />
            <span className="ms-2">{t("buttons.run_test_group")}</span>
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
}
