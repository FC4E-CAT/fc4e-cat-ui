import { AxiosError } from "axios";
import type {
  ApiOptions,
  ApiPaginationOptions,
  RegistryActorListResponse,
} from "@/types";
import { APIClient } from "@/api";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

export const useGetActors = ({ size, page, sortBy }: ApiPaginationOptions) =>
  useQuery<RegistryActorListResponse, AxiosError>({
    queryKey: ["actors", { size, page, sortBy }],
    queryFn: async () => {
      const response = await APIClient("").get<RegistryActorListResponse>(
        `/v1/codelist/registry-actors?size=${size}&page=${page}&sortby=${sortBy}`,
      );
      return response.data;
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
        `/v1/codelist/registry-actors?size=${size}&page=${pageParam}`,
      );
      return response.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.number_of_page < lastPage.total_pages) {
        return lastPage.number_of_page + 1;
      } else {
        return undefined;
      }
    },
    retry: false,
    enabled: isRegistered,
  });
