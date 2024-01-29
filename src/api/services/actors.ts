import { AxiosError } from "axios";
import { ActorListResponse, ApiPaginationOptions } from "@/types";
import { APIClient } from "@/api";
import { useQuery } from "@tanstack/react-query";
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
