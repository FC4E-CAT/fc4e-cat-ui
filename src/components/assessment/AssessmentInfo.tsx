/**
 * Component to display and edit the assessment info
 */

import { InputGroup, Form, Col, Row, Accordion } from "react-bootstrap";
import { AssessmentSubject } from "@/types";
import { FaCog, FaLock, FaUserAlt } from "react-icons/fa";

interface AssessmentInfoProps {
  id?: string;
  name: string;
  actor: string;
  type: string;
  org: string;
  orgId: string;
  subject: AssessmentSubject;
  published: boolean;
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
    <Accordion defaultActiveKey="0">
      <Accordion.Item eventKey="0">
        <Accordion.Header>
          <span>
            <FaUserAlt color="green" className="me-2" />
            Submitter
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
                  readOnly
                />
              </InputGroup>
            </Col>
          </Row>
        </Accordion.Body>
      </Accordion.Item>
      <Accordion.Item eventKey="1">
        <Accordion.Header>
          <span>
            <FaCog color="orange" className="me-2" />
            Subject of assessment <em>Object, Entity or Service</em>:
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
      <Accordion.Item eventKey="2">
        <Accordion.Header>
          <span>
            <FaLock color="crimson" className="me-2" />
            Rights, Licencing, or Re-use
          </span>
        </Accordion.Header>
        <Accordion.Body>
          <Row className="m-2">
            <Col>
              <Form.Check
                id="input-info-published"
                label="This Assessment is Public and Licensed with CC 4.0 BY"
                checked={props.published}
                onChange={(e) => {
                  props.onPublishedChange(e.target.checked);
                }}
                className={`${props.published ? "text-success" : "text-muted"}`}
              />
            </Col>
          </Row>
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
  );
};
