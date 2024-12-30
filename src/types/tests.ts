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
