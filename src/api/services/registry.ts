import {
  ApiOptions,
  ApiOptionsSearch,
  RegistryMetricResponse,
  RegistryResourceResponse,
  Statistics,
} from "@/types";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { APIClient } from "../client";
import { AxiosError } from "axios";
import { handleBackendError } from "@/utils";
import { RegistryTest, RegistryTestsResponse, TestInput } from "@/types/tests";

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

export const useCreateTest = (token: string, test: TestInput) => {
  const queryClient = useQueryClient();
  return useMutation(
    async () => {
      const response = await APIClient(token).post<TestInput>(
        `/v1/registry/tests`,
        test,
      );
      return response.data;
    },

    {
      onError: (error: AxiosError) => {
        return handleBackendError(error);
      },
      onSuccess: () => {
        queryClient.invalidateQueries(["registry-tests"]);
        queryClient.invalidateQueries(["all-tests"]);
      },
    },
  );
};

export const useGetTests = ({
  size,
  page,
  token,
  isRegistered,
  search,
  sortBy,
  sortOrder,
}: ApiOptionsSearch) =>
  useQuery({
    queryKey: ["registry-tests", { size, page, sortBy, sortOrder, search }],
    queryFn: async () => {
      let url = `/v1/registry/tests?size=${size}&page=${page}&sort=${sortBy}&order=${sortOrder}`;
      search ? (url = `${url}&search=${search}`) : null;

      const response = await APIClient(token).get<RegistryTestsResponse>(url);

      return response.data;
    },
    onError: (error: AxiosError) => {
      return handleBackendError(error);
    },
    enabled: !!token && isRegistered,
  });

export const useGetTest = ({
  id,
  token,
  isRegistered,
}: {
  id: string;
  token: string;
  isRegistered: boolean;
}) =>
  useQuery({
    queryKey: ["registry-test", id],
    queryFn: async () => {
      let response = null;

      response = await APIClient(token).get<RegistryTest>(
        `/v1/registry/tests/${id}`,
      );
      return response.data;
    },
    onError: (error: AxiosError) => {
      return handleBackendError(error);
    },
    enabled: !!token && isRegistered && id !== "" && id !== undefined,
  });

export const useGetStatistics = () =>
  useQuery({
    queryKey: ["statistics"],
    queryFn: async () => {
      let response = null;

      response = await APIClient().get<Statistics>(`/v1/statistics`);
      return response.data;
    },
    onError: (error: AxiosError) => {
      return handleBackendError(error);
    },
  });

export const useUpdateTest = (token: string, id: string, test: TestInput) => {
  const queryClient = useQueryClient();
  return useMutation(
    async () => {
      const response = await APIClient(token).patch<TestInput>(
        `/v1/registry/tests/${id}`,
        test,
      );
      return response.data;
    },

    {
      onError: (error: AxiosError) => {
        return handleBackendError(error);
      },
      onSuccess: () => {
        queryClient.invalidateQueries(["registry-tests"]);
      },
    },
  );
};
export function useDeleteTest(token: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (testId: string) => {
      return APIClient(token).delete(`/v1/registry/tests/${testId}`);
    },
    // on success refresh test query (so that the deleted test dissapears from list)
    onSuccess: () => {
      queryClient.invalidateQueries(["registry-tests"]);
    },
  });
}

export function useCreateTestVersion({
  token,
  id,
  test,
}: {
  token: string;
  id: string;
  test: TestInput;
}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => {
      return APIClient(token).post(`/v1/registry/tests/${id}/version`, test);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["registry-tests"]);
      queryClient.invalidateQueries(["all-tests"]);
    },
    onError: (error: AxiosError) => {
      return handleBackendError(error);
    },
  });
}

export const useGetRegistryMetrics = ({
  size,
  page,
  token,
  sortBy,
  sortOrder,
  search,
  isRegistered,
}: ApiOptionsSearch) =>
  useQuery({
    queryKey: ["registry-metrics", { size, page, sortBy, sortOrder, search }],
    queryFn: async () => {
      let url = `/v1/registry/metrics?size=${size}&page=${page}&sort=metric.MTR&order=${sortOrder}`;
      search ? (url = `${url}&search=${search}`) : null;

      const response = await APIClient(token).get<RegistryMetricResponse>(url);

      return response.data;
    },
    onError: (error: AxiosError) => {
      return handleBackendError(error);
    },
    enabled: !!token && isRegistered,
  });
