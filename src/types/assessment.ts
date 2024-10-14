import { ResponsePage } from "./common";

/** API response when requesting a template */
export interface TemplateResponse {
  id: number;
  type: AssessmentType;
  actor: ActorType;
  template_doc: Assessment;
}

/** Assessment type part of TemplateResponse from API */
export interface AssessmentType {
  id: number;
  name: string;
  description: string;
}

/** Actor type part of TemplateResponse from API */
export interface ActorType {
  id: number;
  name: string;
  description: string;
}

/** The main body of an assessment */
export interface Assessment {
  id: string;
  name: string;
  status: AssessmentStatus;
  timestamp: string;
  subject: AssessmentSubject;
  assessment_type: AssessmentType;
  actor: AssessmentActor;
  organisation: AssessmentOrg;
  result: AssessmentResult;
  principles: AssessmentPrinciple[];
  published: boolean;
  shared_with_user: boolean;
}

/** Reference with numerical id */
export interface RefNumID {
  id: number;
  name: string;
}

export interface AssessmentActor extends RefNumID {}
export interface AssessmentType extends RefNumID {}

/** Assessment subject */
export interface AssessmentSubject {
  id: string;
  name: string;
  type: string;
  db_id?: number;
}

export type AssessmentSubjectListResponse = ResponsePage<AssessmentSubject[]>;

/** The status of an assesment wether it is public or private */
export enum AssessmentStatus {
  Public = "PUBLIC",
  Private = "PRIVATE",
}

/** An assessment is done on behalf of a specific organisation */
export interface AssessmentOrg {
  id: string;
  name: string;
}

/** An assessment has a definite result wether compliance is met or not and a ranking score */
export interface AssessmentResult {
  compliance: boolean | null;
  ranking: number | null;
}

/** An assessment contains a list of principles */
export interface AssessmentPrinciple {
  id: string;
  name: string;
  criteria: AssessmentCriterion[];
  description: string;
}

/** Each principle contains a list of criteria */
export interface AssessmentCriterion {
  id: string;
  name: string;
  imperative: AssessmentCriterionImperative;
  metric: Metric | Metric[];
  description?: string;
}

/** Each criterion can be either mandatory (must) or optional (should) */
export enum AssessmentCriterionImperative {
  Must = "must",
  MUST = "MUST",
  SHOULD = "SHOULD",
  Should = "should",
}

/** Each criterion includes a SINGLE metric */
export interface Metric {
  type: MetricType;
  algorithm: MetricAlgorithm;
  benchmark: Benchmark;
  value: number | null;
  result: number | null;
  tests: AssessmentTest[];
  benchmark_value?: number;
}

/** Each metric has a type. For now, we only deal with type: number  */
export enum MetricType {
  Number = "number",
}

/** Each metric has an algorithm. For now, we only deal with algorithms: single and sum  */
export enum MetricAlgorithm {
  Sum = "sum",
  Single = "single",
}

/** Each benchmark will gonna have different types  */
export type Benchmark = Record<string, string | number>;

/** Each metric has a list of tests. Test can be of different kinds */

export interface TestBinary {
  id: string;
  name: string;
  description?: string;
  guidance?: Guidance;
  type: "binary" | "Binary-Binary" | "Binary-Manual" | "Binary-Manual-Evidence";
  text: string;
  result: number | null;
  value: boolean | null;
  evidence_url?: EvidenceURL[];
}

export interface TestValue {
  id: string;
  name: string;
  description?: string;
  guidance?: Guidance;
  type: "value" | "Number-Manual" | "Number-Auto";
  text: string;
  result: number | null;
  value: number | null;
  threshold?: number | null;
  value_name: string;
  threshold_name?: string;
  threshold_locked?: boolean;
  benchmark: Benchmark;
  evidence_url?: EvidenceURL[];
}

export interface EvidenceURL {
  url: string;
  description?: string;
}

export interface Guidance {
  id: string;
  description: string;
}

export interface ResultStats {
  totalMandatory: number;
  totalOptional: number;
  mandatoryFilled: number;
  optionalFilled: number;
  mandatory: number;
  optional: number;
}

export type ActorOrgAsmtType = {
  actor_id: number;
  actor_name: string;
  organisation_id: string;
  organisation_name: string;
  assessment_type_id: number;
  assessment_type_name: string;
};

export interface AssessmentAdminListItem {
  id: string;
  name: string;
  user_id: string;
  validation_id: number;
  created_on: string;
  updated_on: string;
  type: string;
  actor: string;
  organisation: string;
  published: boolean;
  subject_name: string;
  subject_type: string;
  compliance: boolean;
  ranking: number;
}

export interface AssessmentAdminDetailsResponse {
  size_of_page: number;
  number_of_page: number;
  total_elements: number;
  total_pages: number;
  content: AssessmentAdminListItem[];
  links: unknown[];
}

export interface AssessmentListItem {
  id: string;
  name: string;
  user_id: string;
  type: string;
  compliance: string;
  ranking: number;
  validation_id: number;
  created_on: string;
  updated_on: string;
  template_id: number;
  published: boolean;
  shared_to_user: boolean;
  shared_by_user: boolean;
  shared: boolean;
  subject_type: string;
  subject_name: string;
  organisation: string;
}

export type AsmtEligibilityResponse = ResponsePage<ActorOrgAsmtType[]>;

export type AssessmentListResponse = ResponsePage<AssessmentListItem[]>;

export type AssessmentCommentResponse = ResponsePage<AssessmentComment[]>;

export interface AssessmentDetailsResponse {
  id: number;
  shared_to_user: boolean;
  assessment_doc: Assessment;
}

/** Each assessment test will gonna have different types - right now only two types: binary/value test are supported  */
export type AssessmentTest = TestValue | TestBinary;

export interface ObjectListItem {
  id: string;
  name: string;
  type: string;
}

/**
 * Type for Assessments available filters
 */
export interface AssessmentFiltersType {
  subject_name: string;
  subject_type: string;
}

export enum AssessmentEditMode {
  Create = "create",
  Edit = "edit",
  Import = "import",
}

export interface AssessmentTypeResponse {
  size_of_page: number;
  number_of_page: number;
  total_elements: number;
  total_pages: number;
  content: AssessmentType[];
}

export interface SharedUsers {
  shared_users: SharedUser[];
}

export interface SharedUser {
  id: string;
  name: string;
  surname: string;
  email: string;
}

export interface AssessmentComment {
  id: number;
  assessment_id: string;
  text: string;
  user: AssessmentCommentUser;
  created_on: string;
}

export interface AssessmentCommentUser {
  id: string;
  name: string;
  surname: string;
  email: string;
}
