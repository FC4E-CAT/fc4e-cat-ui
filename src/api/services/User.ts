import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import Client from "../client";
import { ApiOptions, ApiServiceErr } from "../../types/common";
import { UserResponse, UserListResponse } from "../../types/profile";

const User = {
  useGetProfile: ({ token, isRegistered }: ApiOptions) =>
    useQuery<UserResponse, any>({
      queryKey: ["profile"],
      queryFn: async () => {
        const response = await Client(token).get<UserResponse>(
          `/users/profile`
        );
        return response.data;
      },
      onError: (error) => {
        console.log(error);
        return error.response as ApiServiceErr;
      },
      enabled: !!token && isRegistered,
    }),
  useGetUsers: ({ size, page, sortBy, token, isRegistered }: ApiOptions) =>
    useQuery<UserListResponse, any>({
      queryKey: ["users", { size, page, sortBy }],
      queryFn: async () => {
        const response = await Client(token).get<UserListResponse>(
          `/users?size=${size}&page=${page}&sortby=${sortBy}`
        );
        return response.data;
      },
      onError: (error) => {
        console.log(error.response);
        return error.response as ApiServiceErr;
      },
      enabled: !!token && isRegistered,
    }),
  useUserRegister: ({ token, isRegistered }: ApiOptions) =>
    useQuery<Boolean, AxiosError>({
      queryKey: ["register"],
      queryFn: async () => {
        try {
          const response = await Client(token).post<any>(`/users/register`);
          console.log(response);
          if (response.status === 200) {
            return true;
          }
          else {
            return false;
          }
        } catch (error) {
          const err = error as AxiosError;
          if (err.response?.status === 409) {
            return true;
          }
          else {
            return false;
          }
        }
      },
      enabled: !!token && (isRegistered !== undefined && isRegistered === false),
    }),
};

export default User;
