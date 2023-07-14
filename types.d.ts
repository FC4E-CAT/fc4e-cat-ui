type ApiT = {
  base_url: string;
  version: string;
};

interface ResponsePage<T> {
  size_of_page: number;
  number_of_pages: number;
  total_elements: number;
  total_pages: number;
  links: [
    {
      href: string;
      rel: string;
    }
  ],
  content: T;
}

interface UserProfile {
  id: string;
  registered_on: string;
  user_type: string;
  name: string;
  surname: string;
  email: string;
  updated_on: string;
}

interface Actor {
  id: string;
  name: string;
  description: string;
}

type UserResponse = UserProfile;
type UserListResponse = ResponsePage<UserProfile[]>;
type ActorListResponse = ResponsePage<Actor[]>;


type ApiServiceErr = {
  code: string;
  message: string;
};

interface ApiAuthOptions {
  token: string;
  isRegistered: boolean;
}

interface ApiPaginationOptions {
  size?: number;
  page?: number;
  sortBy?: string;
}

interface ValidationRequest {
  organisation_role: string;
  organisation_id: string;
  organisation_source: string;
  organisation_name: string;
  organisation_website: string;
  actor_id: number;
};

interface ValidationDetailsRequest {
  validation_id: string;
};

interface ValidationStatusUpdate {
  validation_id: string;
  status: string;
};

type ValidationResponse = {
  id: number;
  user_id: string;
  user_name: string;
  user_surname: string;
  user_email: string;
  organisation_role: string;
  organisation_id: string;
  organisation_source: string;
  organisation_name: string;
  organisation_website: string;
  actor_id: number;
  actor_name: string;
  status: string;
  createdOn: string;
  validated_on: string;
  validatedBy: string;
};

type OrganisationRORSearchResult = {
  id: string;
  name: string;
  website: string;
};

type OrganisationRORSearchResultModified = {
  id: string;
  value: string;
  label: string;
  website: string;
};

type OrganisationRORSearchResponse = ResponsePage<OrganisationRORSearchResult[]>;

type OrganisationRORSearchParams = ApiAuthOptions & {
  name: string;
  page?: number;
};

type ApiOptions = ApiAuthOptions & ApiPaginationOptions;
type ValidationRequestParams = ApiAuthOptions & ValidationRequest;
type ValidationDetailsRequestParams = ApiAuthOptions & ValidationDetailsRequest;
type ValidationUpdateStatusParams = ApiAuthOptions & ValidationStatusUpdate;
type APIValidationResponse = ResponsePage<ValidationResponse[]>;

type ComponentProps = {
  toReject?: boolean;
  toApprove?: boolean;
}


type Alert = {
  enabled: boolean;
  type: string;
  message: string;
}