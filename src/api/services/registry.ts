import { ApiOptions, RegistryResourceResponse } from "@/types";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { APIClient } from "../client";
import { AxiosError } from "axios";
import { handleBackendError } from "@/utils";
import {
  RegistryTestsResponse,
  TestDefinitionInput,
  TestHeaderInput,
  TestInput,
} from "@/types/tests";

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

export const useGetAllTestMethods = ({
  token,
  isRegistered,
  size,
}: ApiOptions) =>
  useInfiniteQuery({
    queryKey: ["all-test-methods"],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await APIClient(token).get<RegistryResourceResponse>(
        `/v1/registry/tests/test-method?size=${size}&page=${pageParam}`,
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

export const useCreateTest = (
  token: string,
  testHeader: TestHeaderInput,
  testDefinition: TestDefinitionInput,
) => {
  const queryClient = useQueryClient();
  return useMutation(
    async () => {
      const response = await APIClient(token).post<TestInput>(
        `/v1/registry/tests`,
        {
          test: testHeader,
          test_definition: testDefinition,
        },
      );
      return response.data;
    },

    {
      onError: (error: AxiosError) => {
        return handleBackendError(error);
      },
      onSuccess: () => {
        queryClient.invalidateQueries(["all-tests"]);
      },
    },
  );
};
