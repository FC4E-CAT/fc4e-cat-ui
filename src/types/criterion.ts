import { ResponsePage } from "./common";
import { Principle } from "./principle";

export interface Criterion {
  id: string;
  cri: string;
  label: string;
  description: string;
  imperative: CriterionImperative;
  type_criterion_id: string;
  url: string;
  criterion_parent_id: string;
  populated_by: string;
  last_touch: string;
  principles: Principle[];
}

export interface CriterionImperative {
  id: string;
  imp: string;
  label: string;
}

export type CriterionResponse = ResponsePage<Criterion[]>;
