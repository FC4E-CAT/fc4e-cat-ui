import { ResponsePage } from "./common";
import { MotivationReference } from "./motivation";

export interface Principle {
  id: string;
  pri: string;
  label: string;
  description: string;
  populated_by: string | null;
  last_touch: string;
  used_by_motivations?: MotivationReference[];
}

export interface PrincipleInput {
  pri: string;
  label: string;
  description: string;
}

export type PrincipleResponse = ResponsePage<Principle[]>;
