/** API response when requesting a template */
export interface TemplateResponse {
  id: string;
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
  subject: Subject;
  assessment_type: AssessmentType;
  actor: AssessmentActor;
  organisation: AssessmentOrg;
  result: AssessmentResult;
  principles: Principle[];

}
/** Reference with numerical id */
export interface RefNumID {
  id: number;
  name: string;
}

export interface AssessmentActor extends RefNumID {}
export interface AssessmentType extends RefNumID{}

/** Assessment subject */
export interface Subject {
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
  compliance: boolean;
  ranking: number;
}

/** An assessment contains a list of principles */
export interface Principle {
  name: string;
  criteria: Criterion[]
}

/** Each principle contains a list of criteria */
export interface Criterion {
  name: string;
  type: CriterionType
  metric: Metric;
}

/** Each criterion can be either mandatory or optional */
export enum CriterionType {
  Mandatory = "mandatory",
  Optional = "optional"
}

/** Each criterion includes a SINGLE metric */
export interface Metric {
  type: MetricType;
  algorithm: MetricAlgorithm;
  benchmark: Benchmark
  value: number;
  result: number;
  tests: Test[];
}

/** Each metric has a type. For now, we only deal with type: number  */
export enum MetricType {
  Number = "number"
}

/** Each metric has an algorithm. For now, we only deal with algorithm: sum  */
export enum MetricAlgorithm {
  Sum = "sum"
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
  type: "binary";
  text: string;
  value: 0 | 1;
  evidence_url: string[]
}

/** Each test will gonna have different types - right now only one type: binary test is supported  */
export type Test = TestBinary


