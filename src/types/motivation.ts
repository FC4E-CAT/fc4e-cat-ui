import { ResponsePage } from "./common";

export interface Motivation {
  id: string;
  mtv: string;
  label: string;
  description: string;
  motivation_type_id: string;
  motivation_parent_id: string;
  populated_by: string | null;
  last_touch: string;
  actors: MotivationActor[];
}

export interface MotivationActor {
  id: string;
  act: string;
  label: string;
  description: string;
  uri: string;
  last_touch: string;
}

export type MotivationResponse = ResponsePage<Motivation[]>;
