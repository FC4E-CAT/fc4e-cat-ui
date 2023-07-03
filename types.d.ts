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

type UserResponse = UserProfile;
type UserListResponse = ResponsePage<UserProfile[]>;


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

type ValidationRequestResponse = {
  id: number;
  user_id: string;
  organisation_role: string;
  organisation_id: string;
  organisation_source: string;
  organisation_name: string;
  organisation_website: string;
  actor_id: number;
  status: string;
  createdOn: string;
  validated_on: string;
  validatedBy: string;
};

type ApiOptions = ApiAuthOptions & ApiPaginationOptions;
type ValidationRequestParams = ApiAuthOptions & ValidationRequest;