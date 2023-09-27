/**
 * Component to display and edit the assessment info
 */

import { InputGroup, Form, Col, Row, Accordion } from "react-bootstrap";
import { AssessmentSubject, UserProfile } from "@/types";
import { FaCog, FaInfo, FaLock, FaOrcid, FaUserAlt } from "react-icons/fa";

interface AssessmentInfoProps {
  id?: string;
  name: string;
  actor: string;
  type: string;
  org: string;
  orgId: string;
  subject: AssessmentSubject;
  published: boolean;
  profile?: UserProfile;
  onNameChange(name: string): void;
  onSubjectChange(subject: AssessmentSubject): void;
  onPublishedChange(published: boolean): void;
}

export const AssessmentInfo = (props: AssessmentInfoProps) => {
  function handleSubjectChange(fieldName: string, value: string) {
    return {
      ...props.subject,
      [fieldName]: value,
    };
  }

  return (
    <Accordion defaultActiveKey="acc-1">
      <Accordion.Item eventKey="acc-1">
        <Accordion.Header>
          <span>
            <FaInfo color="blue" className="me-2" />
            General Info
          </span>
        </Accordion.Header>
        <Accordion.Body>
          <Row>
            <Col>
              <InputGroup className="mb-3">
                <InputGroup.Text id="label-info-name">Name:</InputGroup.Text>
                <Form.Control
                  id="input-info-name"
                  value={props.name}
                  onChange={(e) => {
                    props.onNameChange(e.target.value);
                  }}
                  aria-describedby="label-info-name"
                />
              </InputGroup>
            </Col>
          </Row>

          <Row>
            <Col>
              <InputGroup className="mb-3">
                <InputGroup.Text id="label-info-type">Type:</InputGroup.Text>
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
      <Accordion.Item eventKey="acc-2">
        <Accordion.Header>
          <span>
            <FaUserAlt color="green" className="me-2" />
            Submitter
          </span>
        </Accordion.Header>
        <Accordion.Body>
          <Row className="m-2">
            <Col>
              <InputGroup className="mb-3">
                <InputGroup.Text id="label-info-submitter-fname">
                  First Name:
                </InputGroup.Text>
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
                <InputGroup.Text id="label-info-submitter-lname">
                  Last Name:
                </InputGroup.Text>
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
                <InputGroup.Text id="label-info-submitter-affiliation">
                  Affiliation:
                </InputGroup.Text>
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
                <InputGroup.Text id="abel-info-submitter-orcid">
                  <FaOrcid className="me-1" color="#A7CF3A" /> ORCID id:
                </InputGroup.Text>
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
      <Accordion.Item eventKey="acc-3">
        <Accordion.Header>
          <span>
            <FaCog color="orange" className="me-2" />
            Subject of assessment <em>(Object, Entity or Service)</em>
          </span>
        </Accordion.Header>
        <Accordion.Body>
          <Row className="m-2">
            <Col>
              <InputGroup className="mb-3">
                <InputGroup.Text id="label-info-subject-type">
                  Subject Type:
                </InputGroup.Text>
                <Form.Control
                  id="input-info-subject-type"
                  value={props.subject.type}
                  onChange={(e) => {
                    props.onSubjectChange(
                      handleSubjectChange("type", e.target.value),
                    );
                  }}
                  aria-describedby="label-info-subject-type"
                />
              </InputGroup>
            </Col>
            <Col>
              <InputGroup className="mb-3">
                <InputGroup.Text id="label-info-subject-id">
                  Subject Id:
                </InputGroup.Text>
                <Form.Control
                  id="input-info-subject-id"
                  value={props.subject.id}
                  onChange={(e) => {
                    props.onSubjectChange(
                      handleSubjectChange("id", e.target.value),
                    );
                  }}
                  aria-describedby="label-info-subject-id"
                />
              </InputGroup>
            </Col>
            <Col xs={6}>
              <InputGroup className="mb-3">
                <InputGroup.Text id="label-info-subject-name">
                  Subject Name:
                </InputGroup.Text>
                <Form.Control
                  id="input-info-subject-name"
                  value={props.subject.name}
                  onChange={(e) => {
                    props.onSubjectChange(
                      handleSubjectChange("name", e.target.value),
                    );
                  }}
                  aria-describedby="label-info-subject-name"
                />
              </InputGroup>
            </Col>
          </Row>
        </Accordion.Body>
      </Accordion.Item>
      <Accordion.Item eventKey="acc-4">
        <Accordion.Header>
          <span>
            <FaLock color="crimson" className="me-2" />
            Rights, Licencing or Re-use
          </span>
        </Accordion.Header>
        <Accordion.Body>
          <Row className="m-2">
            You can choose to make the assessment public - it is private by
            deafult
            <Form>
              <Form.Check
                className={`mt-2 ${
                  props.published ? "fw-bold text-success" : "text-muted"
                }`}
                type="radio"
                label="The Assessment is Public and Licensed with CC 4.0 BY"
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
                label="The Assessment is Private"
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
