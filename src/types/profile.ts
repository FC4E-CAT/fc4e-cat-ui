import { ResponsePage } from "./common";

export interface UserProfile {
  id: string;
  registered_on: string;
  user_type: string;
  name: string;
  surname: string;
  email: string;
  updated_on: string;
}

export interface UserProfile {
  id: string;
  orcid_id?: string;
  registered_on: string;
  user_type: string;
  name: string;
  surname: string;
  email: string;
  updated_on: string;
  banned: boolean;
}

export interface UserView {
  id: string;
  orcid_id?: string;
  registered_on: string;
  user_type: string;
  name: string;
  surname: string;
  email: string;
  updated_on: string;
  banned: boolean;
  validated_on: string;
  roles: string;
  count_of_validations: string;
  count_of_assessments: string;
}

export type UserResponse = UserProfile;
export type UserListResponse = ResponsePage<UserProfile[]>;
