import { ResponsePage } from "./common";
import { Principle, PrincipleInput } from "./principle";

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
  published: boolean;
}

export interface MetricFull {
  metric_mtr: string;
  metric_label: string;
  metric_description: string;
  type_algorithm_id: string;
  type_metric_id: string;
  type_benchmark_id: string;
  value_benchmark: string;
}

export interface MetricInput {
  mtr: string;
  label: string;
  description: string;
  url: string;
  type_metric_id: string;
  type_algorithm_id: string;
  type_benchmark_id: string;
  value_benchmark: number;
}

export interface MotivationMetric {
  metric_id: string;
  metric_label: string;
  metric_description: string;
}

export interface MetricAssignment {
  metric_id: string;
  relation: string;
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
  published: boolean;
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

export type PrincipleCriterion = {
  criterion_id: string;
  principle_id: string;
  annotation_url: string;
  annotation_text: string;
  relation: string;
};

export interface MotivationMessage {
  code: string;
  messages: string[];
}

export interface MotivationReference {
  id: string;
  mtv: string;
  label: string;
}

export interface MotivationPrincipleInput {
  principle_request: PrincipleInput;
  relation: string;
  annotation?: string;
  annotation_url?: string;
}

export interface MetricTestResponse {
  metric: MetricHeader;
}

export interface MetricHeader {
  id: string;
  name: string;
  tests: MetricTest[];
}

export interface MetricTest {
  db_id: string;
  id: string;
  name: string;
  description: string;
}

export interface MetricTestInput {
  test_id: string;
  relation: string;
}
