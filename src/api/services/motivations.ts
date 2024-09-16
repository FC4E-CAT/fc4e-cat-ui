import { AxiosError } from "axios";
import { APIClient } from "@/api";
import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { handleBackendError } from "@/utils";
import {
  ApiOptions,
  MotivationInput,
  MotivationResponse,
  MotivationTypeResponse,
} from "@/types";

export const useGetMotivations = ({
  size,
  page,
  token,
  isRegistered,
}: ApiOptions) =>
  useQuery({
    queryKey: ["motivations", { size, page }],
    queryFn: async () => {
      const response = await APIClient(token).get<MotivationResponse>(
        `/registry/motivations?size=${size}&page=${page}`,
      );
      return response.data;
    },
    onError: (error: AxiosError) => {
      return handleBackendError(error);
    },
    enabled: !!token && isRegistered,
  });

export const useGetMotivationTypes = ({
  token,
  isRegistered,
  size,
}: ApiOptions) =>
  useInfiniteQuery({
    queryKey: ["motivation-types"],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await APIClient(token).get<MotivationTypeResponse>(
        `/registry/motivation-types?size=${size}&page=${pageParam}`,
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

export const useCreateMotivation = (
  token: string,
  { mtv, label, description, motivation_type_id }: MotivationInput,
) =>
  useMutation(
    async () => {
      const response = await APIClient(token).post<MotivationResponse>(
        `/registry/motivations`,
        {
          mtv,
          label,
          description,
          motivation_type_id,
        },
      );
      return response.data;
    },
    {
      onError: (error: AxiosError) => {
        return handleBackendError(error);
      },
    },
  );
