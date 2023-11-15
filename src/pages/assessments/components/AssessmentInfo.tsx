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
import { FaCog, FaInfo, FaLock, FaUserAlt, FaInfoCircle } from "react-icons/fa";

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
  onNameChange(name: string): void;
  onSubjectChange(subject: AssessmentSubject): void;
  onPublishedChange(published: boolean): void;
}

export const AssessmentInfo = (props: AssessmentInfoProps) => {
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
                <OverlayTrigger
                  key="top"
                  placement="top"
                  overlay={
                    <Tooltip id={`tooltip-top`}>
                      A unique name for the assessment. Give a distinguishing
                      name for this assessment and any possible future versions
                    </Tooltip>
                  }
                >
                  <InputGroup.Text id="label-info-name">
                    <FaInfoCircle className="me-2" /> Name (*)
                  </InputGroup.Text>
                </OverlayTrigger>
                <Form.Control
                  id="input-info-name"
                  placeholder="A unique name for the assessment"
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
                <OverlayTrigger
                  key="top"
                  placement="top"
                  overlay={
                    <Tooltip id={`tooltip-top`}>
                      The type of assessment (e.g. PID Policy)
                    </Tooltip>
                  }
                >
                  <InputGroup.Text id="label-info-type">
                    <FaInfoCircle className="me-2" /> Type
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
                <OverlayTrigger
                  key="top"
                  placement="top"
                  overlay={
                    <Tooltip id={`tooltip-top`}>The user’s name</Tooltip>
                  }
                >
                  <InputGroup.Text id="label-info-name">
                    <FaInfoCircle className="me-2" /> Name
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
                    <Tooltip id={`tooltip-top`}>The user’s surname</Tooltip>
                  }
                >
                  <InputGroup.Text id="label-info-name">
                    <FaInfoCircle className="me-2" /> Surname
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
                    <Tooltip id={`tooltip-top`}>The user’s affiliation</Tooltip>
                  }
                >
                  <InputGroup.Text id="label-info-name">
                    <FaInfoCircle className="me-2" /> Affiliation
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
                    <Tooltip id={`tooltip-top`}>The user’s ORCID ID</Tooltip>
                  }
                >
                  <InputGroup.Text id="label-info-name">
                    <FaInfoCircle className="me-2" /> ORCID ID
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
      <Accordion.Item eventKey="acc-3">
        <Accordion.Header>
          <span>
            <FaCog color="orange" className="me-2" />
            Subject of assessment <em>(Object, Entity or Service)</em>
          </span>
        </Accordion.Header>
        <Accordion.Body>
          <Row className="m-2">
            <AssessmentSelectSubject
              actorId={props.actor?.id}
              subject={props.subject}
              onSubjectChange={props.onSubjectChange}
            />
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
            If you are not yet ready to share an assessment result or it is
            being done for internal purposes only, keep it set to ‘private’.
            Only the results of ‘public’ assessments are visible to others. - it
            is private by deafult
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
