// Common or minor stuff here

import { AssessmentFiltersType } from ".";

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

export interface Actor {
  id: string;
  name: string;
  description: string;
}

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

export interface ApiPublicAssessmentOptions {
  assessmentTypeId?: number;
  actorId?: number;
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

export type ApiOptions = ApiAuthOptions &
  ApiPaginationOptions &
  ApiPublicAssessmentOptions;

export type ApproveRejectProps = {
  toReject?: boolean;
  toApprove?: boolean;
};

// extra data options for custom table
export type TableExtraDataOps =
  | ApiPublicAssessmentOptions
  | AssessmentFiltersType;

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

export type ApiUsers = ApiOptions & {
  type: string;
  search: string;
  status: string;
};

export type ApiValidations = ApiOptions & {
  type: string;
  search: string;
  status: string;
};
