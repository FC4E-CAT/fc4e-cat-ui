/**
 * Component to display and edit the assessment info
 */
import {
  InputGroup,
  Form,
  Col,
  Row,
  Accordion,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import { AssessmentSubject, UserProfile, AssessmentActor } from "@/types";
import { AssessmentSelectSubject } from "./AssessmentSelectSubject";
import {
  FaCog,
  FaInfo,
  FaLock,
  FaUserAlt,
  FaInfoCircle,
  FaExclamationCircle,
} from "react-icons/fa";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

interface AssessmentInfoProps {
  id?: string;
  name: string;
  actor: AssessmentActor;
  type: string;
  org: string;
  orgId: string;
  subject: AssessmentSubject;
  published: boolean;
  profile?: UserProfile;
  reqFields: string[];
  onNameChange(name: string): void;
  onSubjectChange(subject: AssessmentSubject): void;
  onPublishedChange(published: boolean): void;
}

export const AssessmentInfo = (props: AssessmentInfoProps) => {
  const [accKeys, setAccKeys] = useState<string[]>([]);
  const { t } = useTranslation();
  const toggleAccKey = (name: string) => {
    if (accKeys.includes(name)) {
      setAccKeys(accKeys.filter((item) => item !== name));
    } else {
      setAccKeys([...accKeys, name]);
    }
  };

  // call use effect to react to required field changes
  useEffect(() => {
    setAccKeys((keys) => {
      const subjectErrors = ["subject_name", "subject_id", "subject_type"].some(
        (item) => props.reqFields.includes(item),
      );
      const newKeys: string[] = [];
      if (subjectErrors && !keys.includes("acc-3")) newKeys.push("acc-3");
      if (props.reqFields.includes("name") && !keys.includes("acc-1"))
        newKeys.push("acc-1");
      return [...keys, ...newKeys];
    });
  }, [props.reqFields]);

  return (
    <Accordion defaultActiveKey={["acc-1"]} activeKey={accKeys} alwaysOpen>
      <Accordion.Item eventKey="acc-1" id="accordion_general">
        <Accordion.Header onClick={() => toggleAccKey("acc-1")}>
          <span>
            <FaInfo color="blue" className="me-2" />
            {t("page_assessment_edit.general_info")}
            {props.reqFields.includes("name") && (
              <FaExclamationCircle className="ms-2 text-danger rounded-circle bg-white" />
            )}
          </span>
        </Accordion.Header>
        <Accordion.Body>
          <Row>
            <Col>
              <InputGroup className="mb-1">
                <OverlayTrigger
                  key="top"
                  placement="top"
                  overlay={
                    <Tooltip id={`tooltip-top`}>
                      {t("page_assessment_edit.tip_name")}
                    </Tooltip>
                  }
                >
                  <InputGroup.Text id="label-info-name">
                    <FaInfoCircle className="me-2" /> {t("fields.name")} (*)
                  </InputGroup.Text>
                </OverlayTrigger>
                <Form.Control
                  id="input-info-name"
                  placeholder={t("page_assessment_edit.name")}
                  value={props.name}
                  onChange={(e) => {
                    props.onNameChange(e.target.value);
                  }}
                  aria-describedby="label-info-name"
                  className={
                    props.reqFields.includes("name") ? "is-invalid" : ""
                  }
                />
              </InputGroup>
              {props.reqFields.includes("name") && (
                <p className="text-danger text-end">
                  {t("page_assessment_edit.err_name")}
                </p>
              )}
            </Col>
          </Row>

          <Row>
            <Col>
              <InputGroup className="mt-2">
                <OverlayTrigger
                  key="top"
                  placement="top"
                  overlay={
                    <Tooltip id={`tooltip-top`}>
                      {t("page_assessment_edit.tip_type")}
                    </Tooltip>
                  }
                >
                  <InputGroup.Text id="label-info-type">
                    <FaInfoCircle className="me-2" />{" "}
                    {t("page_assessment_edit.type")}
                  </InputGroup.Text>
                </OverlayTrigger>
                <Form.Control
                  id="input-info-type"
                  placeholder={props.type}
                  aria-describedby="label-info-type"
                  className="bg-light text-secondary"
                  readOnly
                />
              </InputGroup>
            </Col>
          </Row>
        </Accordion.Body>
      </Accordion.Item>
      <Accordion.Item eventKey="acc-2" id="accordion_submitter">
        <Accordion.Header onClick={() => toggleAccKey("acc-2")}>
          <span>
            <FaUserAlt color="green" className="me-2" />
            {t("page_assessment_edit.submitter")}
          </span>
        </Accordion.Header>
        <Accordion.Body>
          <Row className="m-2">
            <Col>
              <InputGroup className="mb-3">
                <OverlayTrigger
                  key="top"
                  placement="top"
                  overlay={
                    <Tooltip id={`tooltip-top`}>
                      {t("page_assessment_edit.tip_user_name")}
                    </Tooltip>
                  }
                >
                  <InputGroup.Text id="label-info-name">
                    <FaInfoCircle className="me-2" /> {t("fields.name")}
                  </InputGroup.Text>
                </OverlayTrigger>
                <Form.Control
                  id="input-submitter-fname"
                  value={props.profile?.name}
                  aria-describedby="label-info-submitter-fname"
                  readOnly
                  className="bg-light text-secondary"
                />
              </InputGroup>
            </Col>
            <Col>
              <InputGroup className="mb-3">
                <OverlayTrigger
                  key="top"
                  placement="top"
                  overlay={
                    <Tooltip id={`tooltip-top`}>
                      {t("page_assessment_edit.tip_user_surnname")}
                    </Tooltip>
                  }
                >
                  <InputGroup.Text id="label-info-name">
                    <FaInfoCircle className="me-2" /> {t("fields.surname")}
                  </InputGroup.Text>
                </OverlayTrigger>
                <Form.Control
                  id="input-submitter-lname"
                  value={props.profile?.surname}
                  aria-describedby="label-info-submitter-lname"
                  className="bg-light text-secondary"
                  readOnly
                />
              </InputGroup>
            </Col>
          </Row>
          <Row className="m-2">
            <Col>
              <InputGroup className="mb-3">
                <OverlayTrigger
                  key="top"
                  placement="top"
                  overlay={
                    <Tooltip id={`tooltip-top`}>
                      {t("page_assessment_edit.tip_user_affiliation")}
                    </Tooltip>
                  }
                >
                  <InputGroup.Text id="label-info-name">
                    <FaInfoCircle className="me-2" />{" "}
                    {t("page_assessment_edit.affiliation")}
                  </InputGroup.Text>
                </OverlayTrigger>
                <Form.Control
                  id="input-submitter-affiliation"
                  value={props.org}
                  aria-describedby="label-info-submitter-affiliation"
                  className="bg-light text-secondary"
                  readOnly
                />
              </InputGroup>
            </Col>
            <Col>
              <InputGroup className="mb-3">
                <OverlayTrigger
                  key="top"
                  placement="top"
                  overlay={
                    <Tooltip id={`tooltip-top`}>
                      {t("page_assessment_edit.tip_user_orcid")}
                    </Tooltip>
                  }
                >
                  <InputGroup.Text id="label-info-name">
                    <FaInfoCircle className="me-2" /> {t("fields.orcid")}
                  </InputGroup.Text>
                </OverlayTrigger>
                <Form.Control
                  id="input-submitter-orcid"
                  value={props.profile?.orcid_id}
                  aria-describedby="label-info-submitter-orcid"
                  className="bg-light text-secondary"
                  readOnly
                />
              </InputGroup>
            </Col>
          </Row>
        </Accordion.Body>
      </Accordion.Item>
      <Accordion.Item eventKey="acc-3" id="accordion_subject">
        <Accordion.Header onClick={() => toggleAccKey("acc-3")}>
          <span>
            <FaCog color="orange" className="me-2" />
            {t("page_assessment_edit.subject")}{" "}
            <em>{t("page_assessment_edit.subject_example")}</em>
            {["subject_name", "subject_id", "subject_type"].some((item) =>
              props.reqFields.includes(item),
            ) && (
              <FaExclamationCircle className="ms-2 text-danger rounded-circle bg-white" />
            )}
          </span>
        </Accordion.Header>
        <Accordion.Body>
          <Row className="m-2">
            <AssessmentSelectSubject
              subject={props.subject}
              onSubjectChange={props.onSubjectChange}
              reqFields={props.reqFields}
            />
          </Row>
        </Accordion.Body>
      </Accordion.Item>
      <Accordion.Item eventKey="acc-4" id="accordion_license">
        <Accordion.Header onClick={() => toggleAccKey("acc-4")}>
          <span>
            <FaLock color="crimson" className="me-2" />
            {t("page_assessment_edit.rights")}
          </span>
        </Accordion.Header>
        <Accordion.Body>
          <Row className="m-2">
            {t("page_assessment_edit.rights_text")}
            <Form>
              <Form.Check
                className={`mt-2 ${
                  props.published ? "fw-bold text-success" : "text-muted"
                }`}
                type="radio"
                label={t("page_assessment_edit.rights_public")}
                name="rights-public"
                id="input-check-public"
                value="public"
                checked={props.published}
                onChange={(e) => {
                  props.onPublishedChange(e.target.checked);
                }}
              />

              <Form.Check
                className={`mt-2 text-muted ${
                  !props.published ? "fw-bold" : ""
                }`}
                type="radio"
                label={t("page_assessment_edit.rights_private")}
                name="rights-private"
                id="input-check-private"
                value="private"
                checked={!props.published}
                onChange={(e) => {
                  props.onPublishedChange(!e.target.checked);
                }}
              />
            </Form>
          </Row>
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
  );
};
