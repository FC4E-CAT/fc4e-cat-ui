import { ResponsePage } from "./common";
import { MotivationReference } from "./motivation";

export interface RegistryTest {
  id: string;
  tes: string;
  label: string;
  description: string;
  last_touch?: string;
  version?: string;
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
  db_id?: string;
  id?: string;
  name?: string;
  tooltip?: string;
}

export interface TestParam {
  id: number;
  name: string;
  text: string;
  tooltip: string;
}

export interface TestFull {
  id: string;
  tes?: string;
  label?: string;
  description?: string;
  last_touch?: string;
  version?: string;
  test_method_id?: string;
  label_test_definition?: string;
  motivation_id?: string;
  param_type?: string;
  test_params?: TestParam[];
  test_question?: string;
  used_by_motivations?: MotivationReference[];
  test_versions?: RegistryTest[];
  is_latest_version?: boolean;
  name?: string;
  db_id?: string;
  type_db_id?: string;
  params?: string;
  text?: string;
  tool_tip?: string;
}
