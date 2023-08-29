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
  principles: Principle[];
  published: boolean;
}


/** Reference with numerical id */
export interface RefNumID {
  id: number;
  name: string;
}

export interface AssessmentActor extends RefNumID {}
export interface AssessmentType extends RefNumID{}

/** Assessment subject */
export interface AssessmentSubject {
  id: string;
  name: string;
  type: string
}

/** The status of an assesment wether it is public or private */
export enum AssessmentStatus {
  Public = "PUBLIC",
  Private = "PRIVATE"
}

/** An assessment is done on behalf of a specific organisation */
export interface AssessmentOrg {
  id: string;
  name: string;
}

/** An assessment has a definite result wether compliance is met or not and a ranking score */
export interface AssessmentResult {
  compliance: boolean| null;
  ranking: number | null;
}

/** An assessment contains a list of principles */
export interface Principle {
  id: string
  name: string;
  criteria: Criterion[]
  description: string;
}

/** Each principle contains a list of criteria */
export interface Criterion {
  id: string;
  name: string;
  imperative: CriterionImperative
  metric: Metric;
  description?: string;
}

/** Each criterion can be either mandatory or optional */
export enum CriterionImperative {
  May = "may",
  Should = "should"
}

/** Each criterion includes a SINGLE metric */
export interface Metric {
  type: MetricType;
  algorithm: MetricAlgorithm;
  benchmark: Benchmark
  value: number | null;
  result: number | null;
  tests: AssessmentTest[];
}

/** Each metric has a type. For now, we only deal with type: number  */
export enum MetricType {
  Number = "number"
}

/** Each metric has an algorithm. For now, we only deal with algorithms: single and sum  */
export enum MetricAlgorithm {
  Sum = "sum",
  Single = "single"
}

/** Each metric includes a benchmark. For now, we only deal with equal than greater kind  */
export interface BenchmarkEqualGreaterThan {
  equal_greater_than: number
}

/** Each benchmark will gonna have different types - right now only one type is supported  */
export type Benchmark = BenchmarkEqualGreaterThan

/** Each metric has a list of tests. Test can be of different kinds
 *  For now, we only deal with Tests of Binary kind
 */
export interface TestBinary {
  id:string;
  name:string
  description?: string;
  guidance? :string; 
  type: "binary";
  text: string;
  value: 0 | 1 | null;
  evidence_url: string[]
}

/** Each assessment test will gonna have different types - right now only one type: binary test is supported  */
export type AssessmentTest = TestBinary

export interface ResultStats {
  totalMandatory: number,
  totalOptional: number,
  mandatoryFilled: number,
  optionalFilled: number,
  mandatory: number,
  optional: number
}

export interface AssessmentListItem {
  id: number,
  user_id: string,
  validationId: number
  created_on: number,
  updated_on: string,
  templateId: number,
}

export type AssessmentListResponse = ResponsePage<AssessmentListItem[]>;

export interface AssessmentDetailsResponse {
  id: number
  assessmentDoc: Assessment
}
