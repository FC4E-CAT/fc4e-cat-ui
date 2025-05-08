import { ResponsePage } from "./common";
import { MotivationReference } from "./motivation";

export interface RegistryTestHeader {
  id: string;
  tes: string;
  label: string;
  description: string;
  last_touch?: string;
  version?: number;
}

export interface RegistryTestDefinition {
  id: string;
  test_method_id: string;
  label: string;
  param_type: string;
  test_params: string;
  test_question: string;
  tool_tip: string;
}

export interface RegistryTest {
  test: RegistryTestHeader;
  test_definition: RegistryTestDefinition;
  used_by_motivations?: MotivationReference[];
  test_versions?: RegistryTest[];
  is_latest_version?: boolean;
}

export type RegistryTestsResponse = ResponsePage<RegistryTest[]>;

export interface TestDefinitionInput {
  test_method_id: string;
  label: string;
  param_type: string;
  test_params: string;
  test_question: string;
  tool_tip: string;
}

export interface TestHeaderInput {
  tes: string;
  label: string;
  description: string;
}

export interface TestInput {
  test: TestHeaderInput;
  test_definition: TestDefinitionInput;
}

export interface TestParam {
  id: number;
  name: string;
  text: string;
  tooltip: string;
}
