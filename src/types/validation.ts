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
    actor_id: number;
    actor_name: string;
    status: string;
    created_on: string;
    validated_on: string;
    validated_by: string;
};

export type APIValidationResponse = ResponsePage<ValidationResponse[]>;

export interface ValidationRequest {
    organisation_role: string;
    organisation_id: string;
    organisation_source: string;
    organisation_name: string;
    organisation_website: string;
    actor_id: number;
}

export interface ValidationDetailsRequest {
    validation_id: string;
}

export type ValidationRequestParams = ApiAuthOptions & ValidationRequest;
export type ValidationDetailsRequestParams = ApiAuthOptions & ValidationDetailsRequest;
export type ValidationUpdateStatusParams = ApiAuthOptions & ValidationStatusUpdate;

export interface ValidationStatusUpdate {
    validation_id: string;
    status: string;
}

export type ValidationProps = {
    toReject?: boolean;
    toApprove?: boolean;
}