import { ApiOptions, RegistryResourceResponse } from "@/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { APIClient } from "../client";
import { AxiosError } from "axios";
import { handleBackendError } from "@/utils";
import { RegistryTestsResponse } from "@/types/tests";

export const useGetAllAlgorithms = ({
  token,
  isRegistered,
  size,
}: ApiOptions) =>
  useInfiniteQuery({
    queryKey: ["all-algorithms"],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await APIClient(token).get<RegistryResourceResponse>(
        `/v1/registry/type-algorithm?size=${size}&page=${pageParam}`,
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

export const useGetAllMetricTypes = ({
  token,
  isRegistered,
  size,
}: ApiOptions) =>
  useInfiniteQuery({
    queryKey: ["all-metric-types"],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await APIClient(token).get<RegistryResourceResponse>(
        `/v1/registry/type-metric?size=${size}&page=${pageParam}`,
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

export const useGetAllBenchmarkTypes = ({
  token,
  isRegistered,
  size,
}: ApiOptions) =>
  useInfiniteQuery({
    queryKey: ["all-benchmark-types"],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await APIClient(token).get<RegistryResourceResponse>(
        `/v1/registry/benchmark-types?size=${size}&page=${pageParam}`,
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

export const useGetAllTests = ({ token, isRegistered, size }: ApiOptions) =>
  useInfiniteQuery({
    queryKey: ["all-tests"],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await APIClient(token).get<RegistryTestsResponse>(
        `/v1/registry/tests?size=${size}&page=${pageParam}`,
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
