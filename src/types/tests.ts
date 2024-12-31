import { ResponsePage } from "./common";

export interface RegistryTestHeader {
  id: string;
  tes: string;
  label: string;
  description: string;
}

export interface RegistryTestDefinition {
  id: string;
}

export interface RegistryTest {
  test: RegistryTestHeader;
  test_definition: RegistryTestDefinition;
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
