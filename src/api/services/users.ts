import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { AxiosError } from "axios";
import { APIClient } from "@/api";
import type {
  ApiOptions,
  ApiUsers,
  UserAccess,
  ApiViewUsers,
  UserView,
  AsmtEligibilityResponse,
  UserResponse,
  UserListResponse,
  Pagination,
} from "@/types";

import { handleBackendError } from "@/utils";

export const useGetProfile = ({ token, isRegistered }: ApiOptions) =>
  useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const response =
        await APIClient(token).get<UserResponse>(`/v1/users/profile`);
      return response.data;
    },
    retry: false,
    enabled: isRegistered,
  });

export const useGetAsmtEligibility = ({
  token,
  isRegistered,
  size,
}: ApiOptions) =>
  useInfiniteQuery({
    queryKey: ["assessment-eligibility"],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await APIClient(token).get<AsmtEligibilityResponse>(
        `/v1/users/registry-assessment-eligibility?size=${size}&page=${pageParam}`,
      );
      return response.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const pageMeta = lastPage as Pagination;
      if (pageMeta.number_of_page < pageMeta.total_pages) {
        return pageMeta.number_of_page + 1;
      } else {
        return undefined;
      }
    },
    retry: false,
    enabled: isRegistered,
  });

export const useGetAdminUsers = ({
  size,
  page,
  sortBy,
  token,
  isRegistered,
}: ApiOptions) =>
  useQuery({
    queryKey: ["users", { size, page, sortBy }],
    queryFn: async () => {
      const response = await APIClient(token).get<UserListResponse>(
        `/v1/admin/users?size=${size}&page=${page}&sort=${sortBy}`,
      );
      return response.data;
    },
    enabled: !!token && isRegistered,
  });

export const useGetViewUsers = ({ id, token, isRegistered }: ApiViewUsers) =>
  useQuery({
    queryKey: ["users", { id }],
    queryFn: async () => {
      const response = await APIClient(token).get<UserView>(
        `/v1/admin/users/${id}`,
      );
      return response.data;
    },
    enabled: !!token && isRegistered,
  });

export const useAdminGetUsers = ({
  size,
  page,
  sortBy,
  sortOrder,
  token,
  isRegistered,
  search,
  type,
  status,
}: ApiUsers) =>
  useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      let url = `/v1/admin/users?size=${size}&page=${page}&sort=${sortBy}&order=${sortOrder}`;
      if (search) url += `&search=${search}`;
      if (type) url += `&type=${type}`;
      if (status) url += `&status=${status}`;

      const response = await APIClient(token).get<UserListResponse>(url);
      return response.data;
    },
    enabled: !!token && isRegistered,
  });

export const useUserRegister = () =>
  useMutation({
    mutationFn: async (token: string) => {
      try {
        const response = await APIClient(token).post(`/v1/users/register`);
        if (response.status === 200) {
          return true;
        } else {
          return false;
        }
      } catch (error) {
        const err = error as AxiosError;
        if (err.response?.status === 409) {
          return true;
        } else {
          return false;
        }
      }
    },
    onError: (error: AxiosError) => {
      return handleBackendError(error);
    },
  });

export function useDeleteUser(token: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: UserAccess) => {
      const response = await APIClient(token).put<UserAccess>(
        "/v1/admin/users/deny-access",
        data,
      );
      if (response.status == 200) {
        queryClient.invalidateQueries({ queryKey: ["users"] });
        queryClient.invalidateQueries({ queryKey: ["users", data.user_id] });
      }
      return response.data;
    },

    onError: (error: AxiosError) => {
      return handleBackendError(error);
    },
  });
}

export function useRestoreUser(token: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: UserAccess) => {
      const response = await APIClient(token).put<UserAccess>(
        "/v1/admin/users/permit-access",
        data,
      );
      if (response.status == 200) {
        queryClient.invalidateQueries({ queryKey: ["users"] });
        queryClient.invalidateQueries({ queryKey: ["users", data.user_id] });
      }
      return response.data;
    },

    onError: (error: AxiosError) => {
      return handleBackendError(error);
    },
  });
}
