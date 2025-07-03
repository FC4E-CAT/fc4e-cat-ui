import {
  ApiOptions,
  ApiOptionsSearch,
  MetricInput,
  RegistryMetricResponse,
  RegistryResourceResponse,
  Statistics,
  PrincipleResponse,
  Principle,
  PrincipleInput,
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
  enabled,
}: ApiOptions) =>
  useInfiniteQuery({
    queryKey: ["all-algorithms"],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await APIClient(token).get<RegistryResourceResponse>(
        `/v1/registry/type-algorithm?size=${size}&page=${pageParam}${enabled ? `&enabled=true` : ""}`,
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
  search = "",
  enabled,
}: ApiOptions) =>
  useInfiniteQuery({
    queryKey: ["all-test-methods", search],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await APIClient(token).get<RegistryResourceResponse>(
        `/v1/registry/tests/test-method?size=${size}&page=${pageParam}&search=${search}${enabled ? `&enabled=true` : ""}`,
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

export const useUpdateTestMethodStatus = (token: string) => {
  return useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const response = await APIClient(token).put(
        `/v1/registry/tests/test-method/${id}`,
        { enabled },
      );
      return response.data;
    },
    onError: (error: AxiosError) => {
      return handleBackendError(error);
    },
  });
};

export const useGetAllMetricTypes = ({
  token,
  isRegistered,
  size,
  enabled,
}: ApiOptions) =>
  useInfiniteQuery({
    queryKey: ["all-metric-types"],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await APIClient(token).get<RegistryResourceResponse>(
        `/v1/registry/type-metric?size=${size}&page=${pageParam}${enabled ? `&enabled=true` : ""}`,
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
  enabled,
}: ApiOptions) =>
  useInfiniteQuery({
    queryKey: ["all-benchmark-types"],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await APIClient(token).get<RegistryResourceResponse>(
        `/v1/registry/benchmark-types?size=${size}&page=${pageParam}${enabled ? `&enabled=true` : ""}`,
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

export const useUpdateMetricTypeStatus = (token: string) => {
  return useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const response = await APIClient(token).put(
        `/v1/registry/type-metric/${id}`,
        { enabled },
      );
      return response.data;
    },
    onError: (error: AxiosError) => {
      return handleBackendError(error);
    },
  });
};

export const useUpdateAlgorithmStatus = (token: string) => {
  return useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const response = await APIClient(token).put(
        `/v1/registry/type-algorithm/${id}`,
        { enabled },
      );
      return response.data;
    },
    onError: (error: AxiosError) => {
      return handleBackendError(error);
    },
  });
};

export const useUpdateBenchmarkTypeStatus = (token: string) => {
  return useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const response = await APIClient(token).put(
        `/v1/registry/benchmark-types/${id}`,
        { enabled },
      );
      return response.data;
    },
    onError: (error: AxiosError) => {
      return handleBackendError(error);
    },
  });
};

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
      let url = `/v1/registry/metrics?size=${size}&page=${page}&sort=${sortBy}&order=${sortOrder}`;
      search ? (url = `${url}&search=${search}`) : null;

      const response = await APIClient(token).get<RegistryMetricResponse>(url);

      return response.data;
    },
    onError: (error: AxiosError) => {
      return handleBackendError(error);
    },
    enabled: !!token && isRegistered,
  });

export const useUpdateMetric = (
  token: string,
  id: string,
  metric: MetricInput,
) => {
  const queryClient = useQueryClient();
  return useMutation(
    async () => {
      const response = await APIClient(token).put(
        `/v1/registry/metrics/${id}`,
        metric,
      );
      return response.data;
    },
    {
      onError: (error: AxiosError) => {
        return handleBackendError(error);
      },
      onSuccess: () => {
        queryClient.invalidateQueries(["registry-metrics"]);
      },
    },
  );
};

export const useCreateMetricVersion = ({
  token,
  id,
  metric,
}: {
  token: string;
  id: string;
  metric: MetricInput;
}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => {
      return APIClient(token).post(
        `/v1/registry/metrics/${id}/version-metric`,
        metric,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["registry-metrics"]);
    },
    onError: (error: AxiosError) => {
      return handleBackendError(error);
    },
  });
};

export function useDeleteMetric(token: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (metricId: string) => {
      return APIClient(token).delete(`/v1/registry/metrics/${metricId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["registry-metrics"]);
    },
    onError: (error: AxiosError) => {
      return handleBackendError(error);
    },
  });
}

export const useCreateMetric = (token: string, metric: MetricInput) => {
  const queryClient = useQueryClient();
  return useMutation(
    async () => {
      const response = await APIClient(token).post(
        `/v1/registry/metrics`,
        metric,
      );
      return response.data;
    },
    {
      onError: (error: AxiosError) => {
        return handleBackendError(error);
      },
      onSuccess: () => {
        queryClient.invalidateQueries(["registry-metrics"]);
      },
    },
  );
};

export const useGetAllPrinciples = ({
  token,
  isRegistered,
  size,
}: ApiOptions) =>
  useInfiniteQuery({
    queryKey: ["all-principles"],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await APIClient(token).get<PrincipleResponse>(
        `/v1/registry/principles?size=${size}&page=${pageParam}`,
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

export const useGetPrinciples = ({
  size,
  page,
  token,
  isRegistered,
  search,
  sortBy,
  sortOrder,
}: ApiOptionsSearch) =>
  useQuery({
    queryKey: [
      "registry-principles",
      { size, page, sortBy, sortOrder, search },
    ],
    queryFn: async () => {
      let url = `/v1/registry/principles?size=${size}&page=${page}&sort=${sortBy}&order=${sortOrder}`;
      search ? (url = `${url}&search=${search}`) : null;

      const response = await APIClient(token).get<PrincipleResponse>(url);

      return response.data;
    },
    onError: (error: AxiosError) => {
      return handleBackendError(error);
    },
    enabled: !!token && isRegistered,
  });

export const useGetPrinciple = ({
  id,
  token,
  isRegistered,
}: {
  id: string;
  token: string;
  isRegistered: boolean;
}) =>
  useQuery({
    queryKey: ["registry-principle", id],
    queryFn: async () => {
      const response = await APIClient(token).get<Principle>(
        `/v1/registry/principles/${id}`,
      );
      return response.data;
    },
    onError: (error: AxiosError) => {
      return handleBackendError(error);
    },
    enabled: !!token && isRegistered && id !== "" && id !== undefined,
  });

export const useCreatePrinciple = (
  token: string,
  principle: PrincipleInput,
) => {
  const queryClient = useQueryClient();
  return useMutation(
    async () => {
      const response = await APIClient(token).post<PrincipleInput>(
        `/v1/registry/principles`,
        principle,
      );
      return response.data;
    },
    {
      onError: (error: AxiosError) => {
        return handleBackendError(error);
      },
      onSuccess: () => {
        queryClient.invalidateQueries(["registry-principles"]);
        queryClient.invalidateQueries(["all-principles"]);
      },
    },
  );
};

export const useUpdatePrinciple = (
  token: string,
  id: string,
  principle: PrincipleInput,
) => {
  const queryClient = useQueryClient();
  return useMutation(
    async () => {
      const response = await APIClient(token).patch<PrincipleInput>(
        `/v1/registry/principles/${id}`,
        principle,
      );
      return response.data;
    },
    {
      onError: (error: AxiosError) => {
        return handleBackendError(error);
      },
      onSuccess: () => {
        queryClient.invalidateQueries(["registry-principles"]);
        queryClient.invalidateQueries(["all-principles"]);
      },
    },
  );
};

export const useDeletePrinciple = (token: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (principleId: string) => {
      return APIClient(token).delete(`/v1/registry/principles/${principleId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["registry-principles"]);
      queryClient.invalidateQueries(["all-principles"]);
    },
    onError: (error: AxiosError) => {
      return handleBackendError(error);
    },
  });
};
