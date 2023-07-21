import Client from "../client";
import decode from "jwt-decode";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ApiOptions, ApiServiceErr } from "../../types/common";
import { APIValidationResponse, ValidationDetailsRequestParams, ValidationResponse, ValidationRequestParams, ValidationUpdateStatusParams } from "../../types/validation";

const Validation = {
  useGetValidationList: ({
    size,
    page,
    sortBy,
    token,
    isRegistered,
  }: ApiOptions) =>
    useQuery<APIValidationResponse, any>({
      queryKey: ["validations", { size, page, sortBy }],
      queryFn: async () => {
        const response = await Client(token).get<APIValidationResponse>(
          `/validations?size=${size}&page=${page}&sortby=${sortBy}`
        );
        return response.data;
      },
      onError: (error) => {
        console.log(error.response);
        return error.response as ApiServiceErr;
      },
      staleTime: 0,
      enabled: !!token && isRegistered,
    }),
  useAdminValidations: ({
    size,
    page,
    sortBy,
    token,
    isRegistered,
  }: ApiOptions) =>
    useQuery<APIValidationResponse, any>({
      queryKey: ["admin_validations", { size, page, sortBy }],
      queryFn: async () => {
        const response = await Client(token).get<APIValidationResponse>(
          `/admin/validations?size=${size}&page=${page}&sortby=${sortBy}`
        );
        return response.data;
      },
      onError: (error) => {
        console.log(error.response);
        return error.response as ApiServiceErr;
      },
      staleTime: 0,
      enabled: !!token && isRegistered,
    }),
  useGetValidationDetails: ({
    validation_id,
    token,
    isRegistered,
  }: ValidationDetailsRequestParams) =>
    useQuery<ValidationResponse, any>({
      queryKey: ["validation_details"],
      queryFn: async () => {
        const jwt = JSON.stringify(decode(token));
        let response = null;
        if (jwt.includes("admin")) {
          response = await Client(token).get<ValidationResponse>(
            `/admin/validations/${validation_id}`
          );
        } else {
          response = await Client(token).get<ValidationResponse>(
            `/validations/${validation_id}`
          );
        }
        return response.data;
      },
      onError: (error) => {
        console.log(error);
        return error.response as ApiServiceErr;
      },
      enabled: !!token && isRegistered && (validation_id !== ""),
    }),
  useValidationRequest: ({
    organisation_role,
    organisation_id,
    organisation_source,
    organisation_name,
    organisation_website,
    actor_id,
    token,
  }: ValidationRequestParams) =>
    useMutation<ValidationResponse, any>(
      async () => {
        const response = await Client(token).post<ValidationResponse>(
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
        onError: (error) => {
          console.log(error);
          return error.response as ApiServiceErr;
        },
      }
    ),
  useValidationStatusUpdate: ({
    validation_id,
    status,
    token,
  }: ValidationUpdateStatusParams) =>
    useMutation<ValidationResponse, any>(
      async () => {
        const response = await Client(token).put<ValidationResponse>(
          `/admin/validations/${validation_id}/update-status`,
          {
            status,
            token,
          }
        );
        return response.data;
      },
      {
        onError: (error) => {
          console.log(error);
          return error.response as ApiServiceErr;
        },
      }
    ),
};

export default Validation;
