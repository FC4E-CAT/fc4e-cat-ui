import { useQuery, useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import Client from "../client";
import { ApiOptions } from "../../types/common";
import { UserResponse, UserListResponse } from "../../types/profile";
import { handleBackendError } from "../../utils/Utils";

const User = {
  useGetProfile: ({ token, isRegistered }: ApiOptions) =>
    useQuery({
      queryKey: ["profile"],
      queryFn: async () => {
        const response = await Client(token).get<UserResponse>(
          `/users/profile`
        );
        return response.data;
      },
      onError: (error: AxiosError) => {
        return handleBackendError(error);
      },
      retry: false,
      enabled: isRegistered,
    }),
  useGetUsers: ({ size, page, sortBy, token, isRegistered }: ApiOptions) =>
    useQuery({
      queryKey: ["users", { size, page, sortBy }],
      queryFn: async () => {
        const response = await Client(token).get<UserListResponse>(
          `/users?size=${size}&page=${page}&sortby=${sortBy}`
        );
        return response.data;
      },
      onError: (error: AxiosError) => {
        return handleBackendError(error);
      },
      enabled: !!token && isRegistered,
    }),
  useUserRegister: () =>
    useMutation(
      async (token: string) => {
        try {
          const response = await Client(token).post(`/users/register`);
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
      }
    ),
};

export default User;
