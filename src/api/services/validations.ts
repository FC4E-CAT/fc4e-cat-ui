import {APIClient} from "@/api";
import decode from "jwt-decode";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ApiOptions } from "@/types";
import { APIValidationResponse, ValidationDetailsRequestParams, ValidationResponse, ValidationRequestParams, ValidationUpdateStatusParams } from "@/types";
import { AxiosError } from "axios";
import { handleBackendError } from "@/utils";


export const useGetValidationList = ({
    size,
    page,
    sortBy,
    token,
    isRegistered,
  }: ApiOptions) =>
    useQuery({
      queryKey: ["validations", { size, page, sortBy }],
      queryFn: async () => {
        const response = await APIClient(token).get<APIValidationResponse>(
          `/validations?size=${size}&page=${page}&sortby=${sortBy}`
        );
        return response.data;
      },
      onError: (error: AxiosError) => {
        return handleBackendError(error);
      },
      staleTime: 0,
      enabled: !!token && isRegistered,
    });

export const useAdminValidations = ({
    size,
    page,
    sortBy,
    token,
    isRegistered,
  }: ApiOptions) =>
    useQuery({
      queryKey: ["admin_validations", { size, page, sortBy }],
      queryFn: async () => {
        const response = await APIClient(token).get<APIValidationResponse>(
          `/admin/validations?size=${size}&page=${page}&sortby=${sortBy}`
        );
        return response.data;
      },
      onError: (error: AxiosError) => {
        return handleBackendError(error);
      },
      staleTime: 0,
      enabled: !!token && isRegistered,
    });

export const useGetValidationDetails = ({
    validation_id,
    token,
    isRegistered,
  }: ValidationDetailsRequestParams) =>
    useQuery({
      queryKey: ["validation_details", validation_id],
      queryFn: async () => {
       
        const jwt = JSON.stringify(decode(token));
        let response = null;
        if (jwt.includes("admin")) {
          response = await APIClient(token).get<ValidationResponse>(
            `/admin/validations/${validation_id}`
          );
        } else {
          response = await APIClient(token).get<ValidationResponse>(
            `/validations/${validation_id}`
          );
        }
        return response.data;
      },
      onError: (error: AxiosError) => {
        return handleBackendError(error);
      },
      enabled: !!token && isRegistered && (validation_id !== "" && validation_id !== undefined),
    });

export const useValidationRequest = ({
    organisation_role,
    organisation_id,
    organisation_source,
    organisation_name,
    organisation_website,
    actor_id,
    token,
  }: ValidationRequestParams) =>
    useMutation(
      async () => {
        const response = await APIClient(token).post<ValidationResponse>(
          `/validations`,
          {
            organisation_role,
            organisation_id,
            organisation_source,
            organisation_name,
            organisation_website,
            actor_id,
            token,
          }
        );
        return response.data;
      },
      {
        onError: (error: AxiosError) => {
          return handleBackendError(error);
        },
      }
    );

export const useValidationStatusUpdate = ({
    validation_id,
    status,
    token,
  }: ValidationUpdateStatusParams) =>
    useMutation(
      async () => {
        const response = await APIClient(token).put<ValidationResponse>(
          `/admin/validations/${validation_id}/update-status`,
          {
            status,
            token,
          }
        );
        return response.data;
      },
      {
        onError: (error: AxiosError) => {
          return handleBackendError(error);
        },
      }
    );
    

