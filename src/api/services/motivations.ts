import { AxiosError } from "axios";
import { APIClient } from "@/api";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { handleBackendError } from "@/utils";
import {
  ApiOptions,
  ApiOptionsSearch,
  CriImp,
  MetricAssignment,
  MetricFull,
  MetricInput,
  MetricResponse,
  MetricTestInput,
  MetricTestResponse,
  Motivation,
  MotivationActorResponse,
  MotivationInput,
  MotivationMetricResponse,
  MotivationResponse,
  MotivationTypeResponse,
  PrincipleCriterion,
  PrincipleInput,
  PrincipleResponse,
  RelationResponse,
} from "@/types";
import { CriterionMetricResponse, CriterionResponse } from "@/types/criterion";
import { relMtvPrincipleId } from "@/config";

export const useGetMotivations = ({
  size,
  page,
  sortBy,
  sortOrder,
  token,
  isRegistered,
  search,
}: ApiOptionsSearch) =>
  useQuery({
    queryKey: ["motivations", { size, page, sortBy }],
    queryFn: async () => {
      const response = await APIClient(token).get<MotivationResponse>(
        `/v1/registry/motivations?size=${size}&page=${page}&sort=${sortBy}&order=${sortOrder}${search ? "&search=" + search : ""}`,
      );
      return response.data;
    },
    onError: (error: AxiosError) => {
      return handleBackendError(error);
    },
    enabled: !!token && isRegistered,
  });

export const useGetMotivation = ({
  id,
  token,
  isRegistered,
}: {
  id: string;
  token: string;
  isRegistered: boolean;
}) =>
  useQuery({
    queryKey: ["motivations", id],
    queryFn: async () => {
      let response = null;

      response = await APIClient(token).get<Motivation>(
        `/v1/registry/motivations/${id}`,
      );
      return response.data;
    },
    onError: (error: AxiosError) => {
      return handleBackendError(error);
    },
    enabled: !!token && isRegistered && id !== "" && id !== undefined,
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
        `/v1/registry/motivation-types?size=${size}&page=${pageParam}`,
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

export const useGetAllActors = ({ token, isRegistered, size }: ApiOptions) =>
  useInfiniteQuery({
    queryKey: ["all-actors"],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await APIClient(token).get<MotivationActorResponse>(
        `/v1/codelist/registry-actors?size=${size}&page=${pageParam}`,
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

export const useGetRelations = ({ token, isRegistered, size }: ApiOptions) =>
  useInfiniteQuery({
    queryKey: ["relations"],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await APIClient(token).get<RelationResponse>(
        `/v1/registry/relations?size=${size}&page=${pageParam}`,
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
  { mtv, label, description, motivation_type_id, based_on }: MotivationInput,
) => {
  const queryClient = useQueryClient();
  return useMutation(
    async () => {
      const response = await APIClient(token).post<MotivationResponse>(
        `/v1/registry/motivations`,
        {
          mtv,
          label,
          description,
          motivation_type_id,
          based_on,
        },
      );
      return response.data;
    },

    {
      onError: (error: AxiosError) => {
        return handleBackendError(error);
      },
      onSuccess: () => {
        queryClient.invalidateQueries(["motivations"]);
      },
    },
  );
};

export function usePublishMotivation(token: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (mtvId: string) => {
      return APIClient(token).put(`/v1/registry/motivations/${mtvId}/publish`);
    },
    // on success refresh motivation query
    onSuccess: () => {
      queryClient.invalidateQueries(["motivations"]);
    },
  });
}

export function useUnpublishMotivation(token: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (mtvId: string) => {
      return APIClient(token).put(
        `/v1/registry/motivations/${mtvId}/unpublish`,
      );
    },
    // on success refresh motivation query
    onSuccess: () => {
      queryClient.invalidateQueries(["motivations"]);
    },
  });
}

export function usePublishMotivationActor(token: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ mtvId, actId }: { mtvId: string; actId: string }) => {
      return APIClient(token).put(
        `/v1/registry/motivations/${mtvId}/actors/${actId}/publish`,
      );
    },
    // on success refresh motivations/mtvId query
    onSuccess: (_, params) => {
      queryClient.invalidateQueries(["motivations", params.mtvId]);
    },
  });
}

export function useUnpublishMotivationActor(token: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ mtvId, actId }: { mtvId: string; actId: string }) => {
      return APIClient(token).put(
        `/v1/registry/motivations/${mtvId}/actors/${actId}/unpublish`,
      );
    },
    // on success refresh motivations/mtvId query
    onSuccess: (_, params) => {
      queryClient.invalidateQueries(["motivations", params.mtvId]);
    },
  });
}

export const useUpdateMotivation = (
  token: string,
  id: string,
  { mtv, label, description, motivation_type_id }: MotivationInput,
) => {
  const queryClient = useQueryClient();
  return useMutation(
    async () => {
      const response = await APIClient(token).patch<MotivationResponse>(
        `/v1/registry/motivations/${id}`,
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
      onSuccess: () => {
        queryClient.invalidateQueries(["motivations", id]);
      },
    },
  );
};

export const useMotivationAddActor = (
  token: string,
  motivationId: string,
  actorId: string,
  relation: string,
) => {
  const queryClient = useQueryClient();
  return useMutation(
    async () => {
      const response = await APIClient(token).post<MotivationResponse>(
        `/v1/registry/motivations/${motivationId}/actors`,
        [
          {
            actor_id: actorId,
            relation: relation,
          },
        ],
      );
      return response.data;
    },
    {
      onError: (error: AxiosError) => {
        return handleBackendError(error);
      },
      onSuccess: () => {
        queryClient.invalidateQueries(["motivations", motivationId]);
      },
    },
  );
};

export const useGetMotivationPrinciples = (
  mtvId: string,
  { token, isRegistered, size }: ApiOptions,
) =>
  useInfiniteQuery({
    queryKey: ["motivation-principles", mtvId],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await APIClient(token).get<PrincipleResponse>(
        `/v1/registry/motivations/${mtvId}/principles?size=${size}&page=${pageParam}`,
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

export const useGetAllMotivationMetrics = (
  mtvId: string,
  { token, isRegistered, size }: ApiOptions,
) =>
  useInfiniteQuery({
    queryKey: ["motivation-metrics", mtvId],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await APIClient(token).get<MotivationMetricResponse>(
        `/v1/registry/motivations/${mtvId}/metric-definition?size=${size}&page=${pageParam}`,
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

export const useGetMotivationCriteria = (
  mtvId: string,
  { token, isRegistered, size }: ApiOptions,
) =>
  useInfiniteQuery({
    queryKey: ["motivation-criteria"],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await APIClient(token).get<CriterionResponse>(
        `/v1/registry/motivations/${mtvId}/criteria?size=${size}&page=${pageParam}`,
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

export const useGetMotivationMetricTests = (
  mtvId: string,
  mtrId: string,
  { token, isRegistered, size }: ApiOptions,
) =>
  useInfiniteQuery({
    queryKey: ["motivation-metric-tests", mtvId, mtrId],
    queryFn: async ({ pageParam = 100 }) => {
      const response = await APIClient(token).get<MetricTestResponse>(
        `/v1/registry/motivations/${mtvId}/metrics/${mtrId}/test?size=${size}&page=${pageParam}`,
      );
      return response.data;
    },
    getNextPageParam: () => {
      return undefined;
    },
    onError: (error: AxiosError) => {
      return handleBackendError(error);
    },
    retry: false,
    enabled: isRegistered,
  });

export const useGetMotivationActorCriteria = (
  mtvId: string,
  actId: string,
  { token, isRegistered, size }: ApiOptions,
) =>
  useInfiniteQuery({
    queryKey: ["motivation-actor-criteria"],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await APIClient(token).get<CriterionResponse>(
        `/v1/registry/motivations/${mtvId}/actors/${actId}/criteria?size=${size}&page=${pageParam}`,
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

export const useGetMotivationMetric = ({
  mtvId,
  itemId,
  token,
  getByCriterion,
}: {
  mtvId: string;
  itemId: string;
  token: string;
  getByCriterion: boolean;
}) =>
  useQuery({
    queryKey: getByCriterion
      ? ["motivation-criterion-metric", mtvId, itemId]
      : ["motivation-metric", mtvId, itemId],
    queryFn: async () => {
      let response = null;
      const url = getByCriterion
        ? `/v1/registry/motivations/${mtvId}/criteria/${itemId}`
        : `/v1/registry/motivations/${mtvId}/metrics/${itemId}/test`;
      response = await APIClient(token).get<CriterionMetricResponse>(url);
      return response.data;
    },
    onError: (error: AxiosError) => {
      return handleBackendError(error);
    },
    enabled: !!token,
  });

export const useGetMotivationMetricFull = ({
  mtvId,
  mtrId,
  token,
}: {
  mtvId: string;
  mtrId: string;
  token: string;
}) =>
  useQuery({
    queryKey: ["motivation-metric-full", mtvId, mtrId],
    queryFn: async () => {
      const response = await APIClient(token).get<MetricFull>(
        `/v1/registry/motivations/${mtvId}/metric/${mtrId}`,
      );
      return response.data;
    },
    onError: (error: AxiosError) => {
      return handleBackendError(error);
    },
    enabled: !!token && !!mtrId,
  });

export function useUpdateMotivationActorCriteria(
  token: string,
  mtvId: string,
  actId: string,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (putData: CriImp[]) => {
      return APIClient(token).put(
        `/v1/registry/motivations/${mtvId}/actors/${actId}/criteria`,
        putData,
      );
    },
    // on change refresh motivation-actor-criteria list
    onSuccess: () => {
      queryClient.invalidateQueries(["motivation-actor-criteria"]);
    },
  });
}

export function useUpdateMotivationPrinciplesCriteria(
  token: string,
  mtvId: string,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (putData: PrincipleCriterion[]) => {
      return APIClient(token).put(
        `/v1/registry/motivations/${mtvId}/principles-criteria`,
        putData,
      );
    },
    // on change refresh motivation-principle-criteria list
    onSuccess: () => {
      queryClient.invalidateQueries(["motivation-principles-criteria"]);
    },
  });
}

export function useDeleteMotivationMetric(token: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ mtrId }: { mtrId: string }) => {
      return APIClient(token).delete(`/v1/registry/metrics/${mtrId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["motivation-metrics"]);
      queryClient.invalidateQueries(["all-metrics"]);
    },
  });
}

export function useDeleteMotivationActor(token: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ mtvId, actId }: { mtvId: string; actId: string }) => {
      return APIClient(token).delete(
        `/v1/registry/motivations/${mtvId}/actors/${actId}`,
      );
    },
    // on success refresh motivation query (so that the deleted actor dissapears from list)
    onSuccess: (_, params) => {
      queryClient.invalidateQueries(["motivations", params.mtvId]);
    },
  });
}
export const useCreateMotivationPrinciple = (
  token: string,
  mtvId: string,
  { pri, label, description }: PrincipleInput,
) => {
  const queryClient = useQueryClient();
  return useMutation(
    async () => {
      const response = await APIClient(token).post<PrincipleResponse>(
        `/v1/registry/motivations/${mtvId}/principle`,
        {
          principle_request: {
            pri,
            label,
            description,
          },
          relation: relMtvPrincipleId,
        },
      );
      return response.data;
    },

    {
      onError: (error: AxiosError) => {
        return handleBackendError(error);
      },
      onSuccess: () => {
        queryClient.invalidateQueries(["motivation-principles", mtvId]);
      },
    },
  );
};

export const useUpdateMotivationMetric = (
  token: string,
  mtvId: string,
  mtrId: string,
  {
    mtr,
    label,
    description,
    type_algorithm_id,
    type_metric_id,
    type_benchmark_id,
    url,
    value_benchmark,
  }: MetricInput,
) => {
  const queryClient = useQueryClient();
  return useMutation(
    async () => {
      const response = await APIClient(token).patch<MetricResponse>(
        `/v1/registry/motivations/${mtvId}/metric/${mtrId}`,
        {
          mtr,
          label,
          description,
          type_algorithm_id,
          type_metric_id,
          type_benchmark_id,
          url,
          value_benchmark,
        },
      );
      return response.data;
    },

    {
      onError: (error: AxiosError) => {
        return handleBackendError(error);
      },
      onSuccess: () => {
        queryClient.invalidateQueries(["motivation-metrics"]);
        queryClient.invalidateQueries(["all-metrics"]);
        queryClient.invalidateQueries(["motivation-metric-full", mtvId, mtrId]);
      },
    },
  );
};

export const useCreateMotivationMetric = (
  token: string,
  mtvId: string,
  {
    mtr,
    label,
    description,
    type_algorithm_id,
    type_metric_id,
    type_benchmark_id,
    url,
    value_benchmark,
  }: MetricInput,
) => {
  const queryClient = useQueryClient();
  return useMutation(
    async () => {
      const response = await APIClient(token).post<MetricResponse>(
        `/v1/registry/motivations/${mtvId}/metric`,
        {
          mtr,
          label,
          description,
          type_algorithm_id,
          type_metric_id,
          type_benchmark_id,
          url,
          value_benchmark,
        },
      );
      return response.data;
    },

    {
      onError: (error: AxiosError) => {
        return handleBackendError(error);
      },
      onSuccess: () => {
        queryClient.invalidateQueries(["motivation-metrics"]);
        queryClient.invalidateQueries(["all-metrics"]);
      },
    },
  );
};

export function useUpdateMotivationAssignMetric(
  token: string,
  mtvId: string,
  criId: string,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (putData: MetricAssignment) => {
      return APIClient(token).put(
        `/v1/registry/motivations/${mtvId}/criteria/${criId}/metrics`,
        putData,
      );
    },
    // on change refresh motivation criterion
    onSuccess: () => {
      queryClient.invalidateQueries([
        "motivation-criterion-metric",
        mtvId,
        criId,
      ]);
    },
  });
}

export function useUpdateMotivationMetricTests(
  token: string,
  mtvId: string,
  mtrId: string,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (putData: MetricTestInput[]) => {
      return APIClient(token).put(
        `/v1/registry/motivations/${mtvId}/metrics/${mtrId}/tests`,
        putData,
      );
    },
    // on change refresh motivation-metric-test
    onSuccess: () => {
      queryClient.invalidateQueries(["motivation-metric-tests", mtvId, mtrId]);
    },
  });
}
