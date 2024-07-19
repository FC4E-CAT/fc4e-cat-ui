import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { AxiosError } from "axios";
import { APIClient } from "@/api";
import {
  ApiOptions,
  ApiUsers,
  AsmtEligibilityResponse,
  UserAccess,
} from "@/types";
import { UserResponse, UserListResponse } from "@/types";
import { handleBackendError } from "@/utils";

export const useGetProfile = ({ token, isRegistered }: ApiOptions) =>
  useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const response =
        await APIClient(token).get<UserResponse>(`/users/profile`);
      return response.data;
    },
    onError: (error: AxiosError) => {
      return handleBackendError(error);
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
        `/users/assessment-eligibility?size=${size}&page=${pageParam}`,
      );
      return response.data;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.number_of_page < lastPage.total_pages) {
        return lastPage.number_of_page + 1;
      } else {
        return undefined;
      }
    },
    onError: (error: AxiosError) => {
      return handleBackendError(error);
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
        `/admin/users?size=${size}&page=${page}&sort=${sortBy}`,
      );
      return response.data;
    },
    onError: (error: AxiosError) => {
      return handleBackendError(error);
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
      let url = `/admin/users?size=${size}&page=${page}&sort=${sortBy}&order=${sortOrder}`;
      search ? (url = `${url}&search=${search}`) : null;
      type ? (url = `${url}&type=${type}`) : null;
      status ? (url = `${url}&status=${status}`) : null;

      const response = await APIClient(token).get<UserListResponse>(url);
      return response.data;
    },
    onError: (error: AxiosError) => {
      return handleBackendError(error);
    },
    enabled: !!token && isRegistered,
  });

export const useUserRegister = () =>
  useMutation(
    async (token: string) => {
      try {
        const response = await APIClient(token).post(`/users/register`);
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
    {
      onError: (error: AxiosError) => {
        return handleBackendError(error);
      },
    },
  );

export function useDeleteUser(token: string) {
  const queryClient = useQueryClient();
  return useMutation(
    async (data: UserAccess) => {
      const response = await APIClient(token).put<UserAccess>(
        "/admin/users/deny-access",
        data,
      );
      if (response.status == 200) {
        queryClient.invalidateQueries(["users"]);
        queryClient.invalidateQueries(["users", data.user_id]);
      }
      return response.data;
    },
    {
      onError: (error: AxiosError) => {
        return handleBackendError(error);
      },
    },
  );
}

export function useRestoreUser(token: string) {
  const queryClient = useQueryClient();
  return useMutation(
    async (data: UserAccess) => {
      const response = await APIClient(token).put<UserAccess>(
        "/admin/users/permit-access",
        data,
      );
      if (response.status == 200) {
        queryClient.invalidateQueries(["users"]);
        queryClient.invalidateQueries(["users", data.user_id]);
      }
      return response.data;
    },
    {
      onError: (error: AxiosError) => {
        return handleBackendError(error);
      },
    },
  );
}
