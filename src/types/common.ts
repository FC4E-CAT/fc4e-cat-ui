// Common or minor stuff here

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
  enabled: boolean;
  type: string;
  message: string;
};
