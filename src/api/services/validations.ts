import { APIClient } from "@/api";
import { useQuery, useMutation } from "@tanstack/react-query";
import type {
  ApiOptions,
  ApiValidations,
  APIValidationResponse,
  ValidationDetailsRequestParams,
  ValidationResponse,
  ValidationRequestParams,
  ValidationUpdateStatusParams,
} from "@/types";
import { AxiosError } from "axios";
import { handleBackendError } from "@/utils";

export const useAdminGetValidations = ({
  size,
  page,
  sortBy,
  sortOrder,
  token,
  isRegistered,
  search,
  type,
  status,
}: ApiValidations) =>
  useQuery({
    queryKey: ["validations"],
    queryFn: async () => {
      let url = `/v1/admin/validations?size=${size}&page=${page}`;
      if (sortBy) url += `&sort=${sortBy}`;
      if (sortOrder) url += `&order=${sortOrder}`;
      if (type) url += `&type=${type}`;
      if (status) url += `&status=${status}`;
      if (search) url += `&search=${search}`;
      const response = await APIClient(token).get<APIValidationResponse>(url);
      return response.data;
    },
    enabled: !!token && isRegistered,
  });

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
        `/v1/validations?size=${size}&page=${page}&sortby=${sortBy}`,
      );
      return response.data;
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
        `/v1/admin/validations?size=${size}&page=${page}&sortby=${sortBy}`,
      );
      return response.data;
    },
    staleTime: 0,
    enabled: !!token && isRegistered,
  });

export const useGetValidationDetails = ({
  validation_id,
  token,
  isRegistered,
  adminMode,
}: ValidationDetailsRequestParams) =>
  useQuery({
    queryKey: ["validation_details", validation_id],
    queryFn: async () => {
      let response = null;
      if (adminMode) {
        response = await APIClient(token).get<ValidationResponse>(
          `/v1/admin/validations/${validation_id}`,
        );
      } else {
        response = await APIClient(token).get<ValidationResponse>(
          `/v1/validations/${validation_id}`,
        );
      }

      return response.data;
    },
    enabled:
      !!token &&
      isRegistered &&
      validation_id !== "" &&
      validation_id !== undefined,
  });

export const useValidationRequest = ({
  organisation_role,
  organisation_id,
  organisation_source,
  organisation_name,
  organisation_website,
  registry_actor_id,
  token,
}: ValidationRequestParams) =>
  useMutation({
    mutationFn: async () => {
      const response = await APIClient(token).post<ValidationResponse>(
        `/v1/validations`,
        {
          organisation_role,
          organisation_id,
          organisation_source,
          organisation_name,
          organisation_website,
          registry_actor_id,
          token,
        },
      );
      return response.data;
    },

    onError: (error: AxiosError) => {
      return handleBackendError(error);
    },
  });

export const useValidationStatusUpdate = ({
  validation_id,
  status,
  rejection_reason,
  token,
}: ValidationUpdateStatusParams) =>
  useMutation({
    mutationFn: async () => {
      const response = await APIClient(token).put<ValidationResponse>(
        `/v1/admin/validations/${validation_id}/update-status`,
        {
          status,
          rejection_reason,
          token,
        },
      );
      return response.data;
    },
    onError: (error: AxiosError) => {
      return handleBackendError(error);
    },
  });
