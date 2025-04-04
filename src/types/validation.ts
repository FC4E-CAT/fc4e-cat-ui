import { ApiAuthOptions, ResponsePage } from "./common";

export type ValidationResponse = {
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
  actor_id?: number;
  actor_name?: string;
  status: string;
  created_on: string;
  validated_on: string;
  validated_by: string;
  rejection_reason: string;
  registry_actor_id?: string;
  registry_actor_name?: string;
};

export type APIValidationResponse = ResponsePage<ValidationResponse[]>;

export interface ValidationRequest {
  organisation_role: string;
  organisation_id: string;
  organisation_source: string;
  organisation_name: string;
  organisation_website: string;
  actor_id?: number;
  registry_actor_id?: string;
}

export interface ValidationDetailsRequest {
  validation_id: string;
  adminMode: boolean;
}

export type ValidationRequestParams = ApiAuthOptions & ValidationRequest;
export type ValidationDetailsRequestParams = ApiAuthOptions &
  ValidationDetailsRequest;
export type ValidationUpdateStatusParams = ApiAuthOptions &
  ValidationStatusUpdate;

export interface ValidationStatusUpdate {
  validation_id: string;
  rejection_reason?: string;
  status: string;
}

export type ValidationProps = {
  toReject?: boolean;
  toApprove?: boolean;
  admin?: boolean;
};

export const enum ValidationStatus {
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  REVIEW = "REVIEW",
}
