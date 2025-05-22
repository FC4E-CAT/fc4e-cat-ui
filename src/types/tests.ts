import { ResponsePage } from "./common";
import { MotivationReference } from "./motivation";

export interface RegistryTest {
  id: string;
  tes: string;
  label: string;
  description: string;
  last_touch?: string;
  version?: number;
  test_method_id?: string;
  label_test_definition?: string;
  motivation_id?: string;
  param_type?: string;
  test_params?: string;
  test_question?: string;
  tool_tip?: string;
  used_by_motivations?: MotivationReference[];
  test_versions?: RegistryTest[];
  is_latest_version?: boolean;
}

export type RegistryTestsResponse = ResponsePage<RegistryTest[]>;

export interface TestInput {
  tes: string;
  label: string;
  description: string;
  test_method_id?: string;
  label_test_definition?: string;
  param_type?: string;
  test_params?: string;
  test_question?: string;
  tool_tip?: string;
}

export interface TestParam {
  id: number;
  name: string;
  text: string;
  tooltip: string;
}
