/**
 * Component to that displays a list of validated actor roles in organisations and allows the user to select one
 * as a basis for a new assessment
 */
import { useContext, useEffect, useState } from "react";
import {
  InputGroup,
  Form,
  Row,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import { FaInfoCircle } from "react-icons/fa";
import { AuthContext } from "@/auth";
import { AssessmentSubject } from "@/types";
import { useGetObjectsByActor } from "@/api";

type AssessmentSelectSubjectProps = {
  actorId: number;
  subject: AssessmentSubject;
  onSubjectChange(subject: AssessmentSubject): void;
};

export const AssessmentSelectSubject = (
  props: AssessmentSelectSubjectProps,
) => {
  const { keycloak, registered } = useContext(AuthContext)!;
  const { data: objectsByActor, refetch: refetchObjectsByActor } =
    useGetObjectsByActor({
      actorId: props.actorId <= 0 ? undefined : props.actorId,
      size: 100,
      page: 1,
      sortBy: "asc",
      token: keycloak?.token || "",
      isRegistered: registered,
    });

  const [selected, setSelected] = useState(props.subject.id || "-1");
  useEffect(() => {
    refetchObjectsByActor();
  }, [props.actorId, refetchObjectsByActor]);

  function handleSubjectChange(fieldName: string, value: string) {
    return {
      ...props.subject,
      [fieldName]: value,
    };
  }

  return (
    <>
      <div className="mb-">
        <h6>
          Select an existing subject from previous assessments or define a new
          one
        </h6>
      </div>
      <Row className="mb-2">
        <div className="input-group mb-3">
          <label className="input-group-text" htmlFor="inputGroupSelect01">
            Subject (*)
          </label>
          <select
            className="form-select"
            id="actor_id"
            value={selected}
            onChange={(e) => {
              const objct = objectsByActor?.content
                .filter((t) => t.id === e.target.value)
                .map((t) => {
                  return t;
                });
              if (objct !== undefined) {
                props.onSubjectChange({
                  id: objct[0].id,
                  name: objct[0].name,
                  type: objct[0].type,
                });
                setSelected(e.target.value);
              }
            }}
          >
            <option disabled value={-1}>
              Select Object
            </option>
            {objectsByActor?.content &&
              objectsByActor?.content.map((t, i) => {
                return (
                  <option key={`type-${i}`} value={t.id}>
                    {t.id}-{t.name}-{t.type}
                  </option>
                );
              })}
          </select>
          <button
            className={
              selected !== "-1"
                ? "btn btn-outline-danger"
                : "btn btn-outline-danger disabled"
            }
            type="button"
            disabled={selected === "-1" ? true : false}
            onClick={() => {
              setSelected("-1");
              props.onSubjectChange({
                id: "",
                name: "",
                type: "",
              });
            }}
          >
            Clear Selection
          </button>
        </div>
      </Row>
      <Row>
        <Row>
          <InputGroup className="mb-3">
            <OverlayTrigger
              key="top"
              placement="top"
              overlay={
                <Tooltip id={`tooltip-top`}>
                  A unique identifier for the current subject - this can be a
                  URL, a string representing the service or organisation being
                  assessed, or the PID of a resource owned by you.
                </Tooltip>
              }
            >
              <InputGroup.Text id="label-info-subject-id">
                <FaInfoCircle className="me-2" /> Subject ID (*)
              </InputGroup.Text>
            </OverlayTrigger>
            <Form.Control
              disabled={selected != "-1"}
              id="input-info-subject-id"
              placeholder="A unique identifier for the current subject"
              value={props.subject?.id || ""}
              onChange={(e) => {
                props.onSubjectChange(
                  handleSubjectChange("id", e.target.value),
                );
              }}
              aria-describedby="label-info-subject-id"
            />
          </InputGroup>
        </Row>
        <Row>
          <InputGroup className="mb-3">
            <OverlayTrigger
              key="top"
              placement="top"
              overlay={
                <Tooltip id={`tooltip-top`}>
                  The name of the subject of the assessment as identified above
                </Tooltip>
              }
            >
              <InputGroup.Text id="label-info-subject-name">
                <FaInfoCircle className="me-2" /> Subject Name (*)
              </InputGroup.Text>
            </OverlayTrigger>
            <Form.Control
              disabled={selected != "-1"}
              id="input-info-subject-name"
              placeholder="The name of the subject of the assessment as identified above"
              value={props.subject?.name || ""}
              onChange={(e) => {
                props.onSubjectChange(
                  handleSubjectChange("name", e.target.value),
                );
              }}
              aria-describedby="label-info-subject-name"
            />
          </InputGroup>
        </Row>
        <Row>
          <InputGroup className="mb-3">
            <OverlayTrigger
              key="top"
              placement="top"
              overlay={
                <Tooltip id={`tooltip-top`}>
                  The type of object (such as a web resource identified by the
                  owner) or service provided by an authority, provider, or
                  manager, for which the assessment will be completed.
                </Tooltip>
              }
            >
              <InputGroup.Text id="label-info-subject-type">
                <FaInfoCircle className="me-2" /> Subject Type (*)
              </InputGroup.Text>
            </OverlayTrigger>
            <Form.Control
              disabled={selected != "-1"}
              id="input-info-subject-type"
              placeholder="The type of object for which the assessment will  be completed"
              value={props.subject?.type || ""}
              onChange={(e) => {
                props.onSubjectChange(
                  handleSubjectChange("type", e.target.value),
                );
              }}
              aria-describedby="label-info-subject-type"
            />
          </InputGroup>
        </Row>
      </Row>
    </>
  );
};
