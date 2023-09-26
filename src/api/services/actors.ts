import { AxiosError } from "axios";
import { ActorListResponse, ApiOptions, ApiPaginationOptions } from "@/types";
import { APIClient } from "@/api";
import { useQuery } from "@tanstack/react-query";
import { handleBackendError } from "@/utils";

export const useGetActors = ({
  size,
  page,
  sortBy,
  token,
  isRegistered,
}: ApiOptions) =>
  useQuery({
    queryKey: ["actors", { size, page, sortBy }],
    queryFn: async () => {
      const response = await APIClient(token).get<ActorListResponse>(
        `/codelist/actors?size=${size}&page=${page}&sortby=${sortBy}`,
      );
      return response.data;
    },
    onError: (error: AxiosError) => {
      return handleBackendError(error);
    },
    enabled: !!token && isRegistered,
  });

export const useGetPublicActors = ({
  size,
  page,
  sortBy,
}: ApiPaginationOptions) =>
  useQuery({
    queryKey: ["actors", { size, page, sortBy }],
    queryFn: async () => {
      const response = await APIClient("").get<ActorListResponse>(
        `/public/actors?size=${size}&page=${page}&sortby=${sortBy}`,
      );
      return response.data;
    },
    onError: (error: AxiosError) => {
      return handleBackendError(error);
    },
  });
