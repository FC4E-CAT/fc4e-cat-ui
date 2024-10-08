/**
 * Component to that displays a list of validated actor roles in organisations and allows the user to select one
 * as a basis for a new assessment
 */

import { Form } from "react-bootstrap";
import { ActorOrgAsmtType } from "@/types";

interface AssessmentSelectActorProps {
  actorMap: ActorOrgAsmtType[];
  asmtId?: string;
  templateDataActorId?: number;
  templateDataOrgId?: string;
  templateDataAsmtTypeId?: number;
  actorId?: number;
  orgId?: string;
  asmtTypeId?: number;
  importAsmtTypeId?: number;
  importActorId?: number;
  onSelectActor: (
    actorId: number,
    actorName: string,
    orgId: string,
    orgName: string,
    asmtTypeId: number,
    asmtTypeName: string,
  ) => void;
}

export const AssessmentSelectActor = (props: AssessmentSelectActorProps) => {
  let checked = false;
  let filteredActors = props.actorMap;
  if (props.importAsmtTypeId && props.importActorId) {
    filteredActors = props.actorMap.filter(
      (item) =>
        item.assessment_type_id === props.importAsmtTypeId &&
        item.actor_id === props.importActorId,
    );
  }
  return (
    <>
      <span className="mb-3">
        As a first step you need to select one of your validated actor roles in
        the following organisations:
      </span>
      <div className="p-2">
        <Form.Group
          id="actorRadio"
          style={{ maxHeight: "30vh" }}
          className="overflow-auto px-4 py-2 border"
        >
          {filteredActors &&
            filteredActors.map((t, i) => {
              if (props.actorId && props.orgId) {
                checked =
                  props.actorId === t.actor_id &&
                  props.orgId === t.organisation_id &&
                  props.asmtTypeId === t.assessment_type_id;
              } else {
                checked =
                  props.templateDataActorId === t.actor_id &&
                  props.templateDataOrgId === t.organisation_id &&
                  props.templateDataAsmtTypeId === t.assessment_type_id;
              }

              if (props.asmtId && checked) {
                return (
                  <Form.Check
                    key={`type-${i}`}
                    disabled={!checked}
                    type="radio"
                    aria-label={`radio-${i}`}
                    label={`${t.actor_name} at ${t.organisation_name} - ${t.assessment_type_name}`}
                    onChange={() => {
                      props.onSelectActor(
                        t.actor_id,
                        t.actor_name,
                        t.organisation_id,
                        t.organisation_name,
                        t.assessment_type_id,
                        t.assessment_type_name,
                      );
                    }}
                    checked={checked}
                  />
                );
              } else if (!props.asmtId) {
                return (
                  <Form.Check
                    key={`type-${i}`}
                    type="radio"
                    id={`radio-${i}`}
                    aria-label={`radio-${i}`}
                    label={`${t.actor_name} at ${t.organisation_name} - ${t.assessment_type_name}`}
                    onChange={() => {
                      props.onSelectActor(
                        t.actor_id,
                        t.actor_name,
                        t.organisation_id,
                        t.organisation_name,
                        t.assessment_type_id,
                        t.assessment_type_name,
                      );
                    }}
                    checked={checked}
                  />
                );
              }
            })}
        </Form.Group>
      </div>
    </>
  );
};
