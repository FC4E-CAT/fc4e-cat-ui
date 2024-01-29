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
}

export type UserResponse = UserProfile;
export type UserListResponse = ResponsePage<UserProfile[]>;
