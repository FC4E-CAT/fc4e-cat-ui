// Common or minor stuff here

import { MotivationMetric } from "./motivation";

export type ApiT = {
  base_url: string;
  version: string;
};

export interface ResponsePage<T> {
  size_of_page: number;
  number_of_page: number;
  total_elements: number;
  total_pages: number;
  links: [
    {
      href: string;
      rel: string;
    },
  ];
  content: T;
}

export interface RegistryActor {
  id: string;
  act: string;
  label: string;
  description: string;
}

export interface Actor {
  id: string;
  name: string;
  description: string;
}

export interface RegistryResource {
  id: string;
  label: string;
  description: string;
}

export interface MetricResponse {
  code: string;
}

export type RegistryResourceResponse = ResponsePage<RegistryResource[]>;
export type MotivationMetricResponse = ResponsePage<MotivationMetric[]>;

export type RegistryActorListResponse = ResponsePage<RegistryActor[]>;
export type ActorListResponse = ResponsePage<Actor[]>;
export type SubjectListResponse = ResponsePage<Subject[]>;

export type ApiServiceErr = {
  code: string;
  message: string;
};

export interface ApiAuthOptions {
  token: string;
  isRegistered?: boolean;
}

export interface ApiPaginationOptions {
  size?: number;
  page?: number;
  sortBy?: string;
  sortOrder?: string;
}

export type OrganisationRORSearchResult = {
  id: string;
  name: string;
  website: string;
  acronym?: string;
};

export type OrganisationRORSearchResultModified = {
  id: string;
  value: string;
  label: string;
  website: string;
  acronym?: string;
};

export type OrganisationRORSearchResponse = ResponsePage<
  OrganisationRORSearchResult[]
>;

export type OrganisationRORSearchParams = ApiAuthOptions & {
  name: string;
  page?: number;
};

export type ApiOptions = ApiAuthOptions & ApiPaginationOptions;

export type ApproveRejectProps = {
  toReject?: boolean;
  toApprove?: boolean;
};

export type AlertInfo = {
  message: string;
};

export type Subject = {
  id?: number;
  subject_id: string;
  name: string;
  type: string;
};

export type UserAccess = {
  user_id: string;
  reason?: string;
};

export type ApiViewUsers = ApiOptions & {
  id: string;
};

export type ApiOptionsSearch = ApiOptions & {
  search: string;
};

export type ApiUsers = ApiOptions & {
  type: string;
  search: string;
  status: string;
};

export type ApiObjects = ApiOptions & {
  actorId: string;
  assessmentTypeId: string;
};

export type ApiAssessments = ApiOptions & {
  isPublic: boolean;
  subject_type: string;
  subject_name: string;
  actorId: string;
  motivationId: string;
};

export type ApiValidations = ApiOptions & {
  type: string;
  search: string;
  status: string;
};

export interface HttpTestResponse {
  code: number;
  is_valid_https?: boolean;
  message?: string;
}

export interface Md1TestResponse {
  code: number;
  is_valid?: boolean;
  message?: string;
}

export interface Statistics {
  user_statistics: StatsUsers;
  assessment_statistics: StatsAssessments;
  validation_statistics: StatsValidations;
  subject_statistics: StatsSubjects;
}

export interface StatsUsers {
  total_users: number;
  validated_users: number;
  banned_users: number;
  identified_users: number;
}

export interface StatsAssessments {
  total_assessments: number;
  public_assessments: number;
  private_assessments: number;
  assessment_per_role: AssessmentPerRole[];
}

export interface AssessmentPerRole {
  actor: string;
  total_assessments: number;
}

export interface StatsValidations {
  total_validations: number;
  accepted_validations: number;
  pending_validations: number;
}

export interface StatsSubjects {
  total_subjects: number;
}
