import { ResponsePage } from "./common";
import { Principle } from "./principle";

export interface Criterion {
  cri: string;
  label: string;
  description: string;
  imperative: string;
  type_criterion_id: string;
  url: string;
  criterion_parent_id: string;
  populated_by: string;
  last_touch: string;
  principles: Principle[];
}

export type CriterionResponse = ResponsePage<Criterion[]>;
