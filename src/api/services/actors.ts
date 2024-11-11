import { AxiosError } from "axios";
import {
  ActorListResponse,
  ApiOptions,
  ApiPaginationOptions,
  RegistryActorListResponse,
} from "@/types";
import { APIClient } from "@/api";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { handleBackendError } from "@/utils";

export const useGetActors = ({ size, page, sortBy }: ApiPaginationOptions) =>
  useQuery({
    queryKey: ["actors", { size, page, sortBy }],
    queryFn: async () => {
      const response = await APIClient("").get<ActorListResponse>(
        `/codelist/actors?size=${size}&page=${page}&sortby=${sortBy}`,
      );
      return response.data;
    },
    onError: (error: AxiosError) => {
      return handleBackendError(error);
    },
  });

export const useGetAllRegistryActors = ({
  token,
  isRegistered,
  size,
}: ApiOptions) =>
  useInfiniteQuery({
    queryKey: ["all-registry-actors"],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await APIClient(token).get<RegistryActorListResponse>(
        `/codelist/registry-actors?size=${size}&page=${pageParam}`,
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
