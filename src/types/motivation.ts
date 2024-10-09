import { ResponsePage } from "./common";
import { Principle } from "./principle";

export interface Motivation {
  id: string;
  mtv: string;
  label: string;
  description: string;
  motivation_type_id?: string;
  motivation_type: MotivationType;
  motivation_parent_id: string;
  populated_by: string | null;
  last_touch: string;
  actors: MotivationActor[];
  principles: Principle[];
}

export interface MotivationInput {
  mtv: string;
  label: string;
  description: string;
  motivation_type_id: string;
  based_on: string | null;
}

export interface MotivationActor {
  id: string;
  act: string;
  label: string;
  description: string;
  uri: string;
  last_touch: string;
}

export interface MotivationType {
  id: string;
  mtv: string;
  label: string;
  uri: string;
  description: string;
  populated_by: string;
  last_touch: string;
  version: string;
}

export interface Imperative {
  id: string;
  imp: string;
  label: string;
  description: string;
  populated_by: string;
  last_touch: string;
}

export interface Relation {
  id: string;
  label: string;
  description: string;
  url: string | null;
}

export interface CriImp {
  criterion_id: string;
  imperative_id: string;
}

export type ImperativeResponse = ResponsePage<Imperative[]>;

export type RelationResponse = ResponsePage<Relation[]>;

export type MotivationResponse = ResponsePage<Motivation[]>;

export type MotivationTypeResponse = ResponsePage<MotivationType[]>;

export type MotivationActorResponse = ResponsePage<MotivationActor[]>;

export interface MotivationMessage {
  code: string;
  messages: string[];
}
