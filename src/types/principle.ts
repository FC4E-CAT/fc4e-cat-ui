import { ResponsePage } from "./common";

export interface Principle {
  id: string;
  pri: string;
  label: string;
  description: string;
  populated_by: string | null;
  last_touch: string;
}

export interface PrincipleInput {
  pri: string;
  label: string;
  description: string;
}

export type PrincipleResponse = ResponsePage<Principle[]>;