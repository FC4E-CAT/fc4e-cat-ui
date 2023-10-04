/**
 * Component to that displays a list of validated actor roles in organisations and allows the user to select one
 * as a basis for a new assessment
 */
import { useContext, useEffect, useState } from "react";
import { InputGroup, Form, Row } from "react-bootstrap";
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
      actorId: props.actorId,
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
            Subject
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
            className="btn btn-outline-danger"
            type="button"
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
            <InputGroup.Text id="label-info-subject-id">
              Subject Id:
            </InputGroup.Text>
            <Form.Control
              disabled={selected != "-1"}
              id="input-info-subject-id"
              placeholder="Fill custom subject id"
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
            <InputGroup.Text id="label-info-subject-name">
              Subject Name:
            </InputGroup.Text>
            <Form.Control
              disabled={selected != "-1"}
              id="input-info-subject-name"
              placeholder="Fill custom subject name"
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
            <InputGroup.Text id="label-info-subject-type">
              Subject Type:
            </InputGroup.Text>
            <Form.Control
              disabled={selected != "-1"}
              id="input-info-subject-type"
              placeholder="Fill custom subject type"
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
