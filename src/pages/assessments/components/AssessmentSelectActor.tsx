/**
 * Component to that displays a list of validated actor roles in organisations and allows the user to select one
 * as a basis for a new assessment
 */

import { Form } from "react-bootstrap";
import { ActorOrganisationMapping } from "@/types";

interface AssessmentSelectActorProps {
  actorsOrgsMap: ActorOrganisationMapping[];
  asmtID?: string;
  validationID: string;
  templateDataActorId?: number;
  templateDataOrgName?: string;
  actorId?: number;
  orgName?: string;
  onSelectActor: (
    valId: string,
    actorName: string,
    actorId: number,
    orgName: string,
    orgId: string,
  ) => void;
}

export const AssessmentSelectActor = (props: AssessmentSelectActorProps) => {
  let checked = false;
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
          {props.actorsOrgsMap &&
            props.actorsOrgsMap.map((t, i) => {
              if (props.actorId && props.orgName) {
                checked =
                  props.actorId === t.actor_id &&
                  props.orgName === t.organisation_name;
              } else {
                checked =
                  props.templateDataActorId === t.actor_id &&
                  props.templateDataOrgName === t.organisation_name;
              }
              if ((props.validationID || props.asmtID) && checked) {
                return (
                  <Form.Check
                    key={`type-${i}`}
                    value={t.validation_id}
                    disabled={!checked}
                    type="radio"
                    aria-label={`radio-${i}`}
                    label={`${t.actor_name} at ${t.organisation_name}`}
                    onChange={() => {
                      props.onSelectActor(
                        t.validation_id.toString(),
                        t.actor_name,
                        t.actor_id,
                        t.organisation_name,
                        t.organisation_id,
                      );
                    }}
                    checked={checked}
                  />
                );
              } else if (!props.validationID && !props.asmtID) {
                return (
                  <Form.Check
                    key={`type-${i}`}
                    value={t.validation_id}
                    type="radio"
                    id={`radio-${i}`}
                    aria-label={`radio-${i}`}
                    label={`${t.actor_name} at ${t.organisation_name}`}
                    onChange={() => {
                      props.onSelectActor(
                        t.validation_id.toString(),
                        t.actor_name,
                        t.actor_id,
                        t.organisation_name,
                        t.organisation_id,
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
