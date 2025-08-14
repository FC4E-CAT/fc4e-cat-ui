import { AxiosError } from "axios";
import { APIClient } from "@/api";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { handleBackendError } from "@/utils";
import type {
  ApiOptions,
  ApiOptionsSearch,
  Assessment,
  AutoGroupTest,
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
  PrincipleAssignmentInput,
  PrincipleCriterion,
  PrincipleInput,
  PrincipleResponse,
  RelationResponse,
  Pagination,
} from "@/types";
import type {
  CriterionMetricResponse,
  CriterionResponse,
  CriterionInput,
} from "@/types/criterion";
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
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const pageMeta = lastPage as Pagination;
      if (pageMeta.number_of_page < pageMeta.total_pages) {
        return pageMeta.number_of_page + 1;
      } else {
        return undefined;
      }
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
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const pageMeta = lastPage as Pagination;
      if (pageMeta.number_of_page < pageMeta.total_pages) {
        return pageMeta.number_of_page + 1;
      } else {
        return undefined;
      }
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
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const pageMeta = lastPage as Pagination;
      if (pageMeta.number_of_page < pageMeta.total_pages) {
        return pageMeta.number_of_page + 1;
      } else {
        return undefined;
      }
    },
    retry: false,
    enabled: isRegistered,
  });

export const useCreateMotivation = (
  token: string,
  { mtv, label, description, motivation_type_id, based_on }: MotivationInput,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
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

    onError: (error: AxiosError) => {
      return handleBackendError(error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["motivations"] });
    },
  });
};

export function usePublishMotivation(token: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (mtvId: string) => {
      return APIClient(token).put(`/v1/registry/motivations/${mtvId}/publish`);
    },
    // on success refresh motivation query
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["motivations"] });
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
      queryClient.invalidateQueries({ queryKey: ["motivations"] });
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
      queryClient.invalidateQueries({
        queryKey: ["motivations", params.mtvId],
      });
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
      queryClient.invalidateQueries({
        queryKey: ["motivations", params.mtvId],
      });
    },
  });
}

export const useUpdateMotivation = (
  token: string,
  id: string,
  { mtv, label, description, motivation_type_id }: MotivationInput,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
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

    onError: (error: AxiosError) => {
      return handleBackendError(error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["motivations", id] });
    },
  });
};

export const useMotivationAddActor = (
  token: string,
  motivationId: string,
  actorId: string,
  relation: string,
  autoGroups: AutoGroupTest[],
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await APIClient(token).post<MotivationResponse>(
        `/v1/registry/motivations/${motivationId}/actors`,
        [
          {
            actor_id: actorId,
            relation: relation,
            automated_group_test: autoGroups,
          },
        ],
      );
      return response.data;
    },
    onError: (error: AxiosError) => {
      return handleBackendError(error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["motivations", motivationId],
      });
    },
  });
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
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const pageMeta = lastPage as Pagination;
      if (pageMeta.number_of_page < pageMeta.total_pages) {
        return pageMeta.number_of_page + 1;
      } else {
        return undefined;
      }
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
        `/v1/registry/motivations/${mtvId}/metrics?size=${size}&page=${pageParam}`,
      );
      return response.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const pageMeta = lastPage as Pagination;
      if (pageMeta.number_of_page < pageMeta.total_pages) {
        return pageMeta.number_of_page + 1;
      } else {
        return undefined;
      }
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
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const pageMeta = lastPage as Pagination;
      if (pageMeta.number_of_page < pageMeta.total_pages) {
        return pageMeta.number_of_page + 1;
      } else {
        return undefined;
      }
    },
    retry: false,
    enabled: isRegistered,
  });

export const useGetMotivationCriteriaMutation = (token: string) => {
  return useMutation({
    mutationFn: async ({
      mtvId,
      size = 100,
      page = 1,
    }: {
      mtvId: string;
      size?: number;
      page?: number;
    }) => {
      const response = await APIClient(token).get<CriterionResponse>(
        `/v1/registry/motivations/${mtvId}/criteria?size=${size}&page=${page}`,
      );
      return response.data;
    },
    onError: (error: AxiosError) => {
      return handleBackendError(error);
    },
  });
};

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
    initialPageParam: 1,
    getNextPageParam: () => {
      return undefined;
    },
    retry: false,
    enabled: isRegistered && !!mtvId && !!mtrId,
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
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const pageMeta = lastPage as Pagination;
      if (pageMeta.number_of_page < pageMeta.total_pages) {
        return pageMeta.number_of_page + 1;
      } else {
        return undefined;
      }
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
        `/v1/registry/metrics/${mtrId}`,
      );
      return response.data;
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
      queryClient.invalidateQueries({
        queryKey: ["motivation-actor-criteria"],
      });
    },
  });
}

export function useUpdateActorCriteriaWithDefaultMetric(
  token: string,
  mtvId: string,
  actId: string,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (putData: CriImp[]) => {
      return APIClient(token).put(
        `/v1/registry/motivations/${mtvId}/actors/${actId}/criteria/auto-metric`,
        putData,
      );
    },
    // on change refresh motivation-actor-criteria list
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["motivation-actor-criteria"],
      });
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
      queryClient.invalidateQueries({
        queryKey: ["motivation-principles-criteria"],
      });
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
      queryClient.invalidateQueries({ queryKey: ["motivation-metrics"] });
      queryClient.invalidateQueries({ queryKey: ["all-metrics"] });
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
      queryClient.invalidateQueries({
        queryKey: ["motivations", params.mtvId],
      });
    },
  });
}
export const useCreateMotivationPrinciple = (
  token: string,
  mtvId: string,
  { pri, label, description }: PrincipleInput,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
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
    onError: (error: AxiosError) => {
      return handleBackendError(error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["motivation-principles", mtvId],
      });
    },
  });
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
  return useMutation({
    mutationFn: async () => {
      const response = await APIClient(token).put<MetricResponse>(
        `/v1/registry/metrics/${mtrId}`,
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

    onError: (error: AxiosError) => {
      return handleBackendError(error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["motivation-metrics"] });
      queryClient.invalidateQueries({ queryKey: ["all-metrics"] });
      queryClient.invalidateQueries({
        queryKey: ["motivation-metric-full", mtvId, mtrId],
      });
    },
  });
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
    criterion_id,
  }: MetricInput,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await APIClient(token).post(
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
          criterion_id,
        },
      );
      return response.data;
    },

    onError: (error: AxiosError) => {
      return handleBackendError(error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["motivation-metrics"] });
      queryClient.invalidateQueries({ queryKey: ["all-metrics"] });
    },
  });
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
      queryClient.invalidateQueries({
        queryKey: ["motivation-criterion-metric", mtvId, criId],
      });
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
      queryClient.invalidateQueries({
        queryKey: ["motivation-metric-tests", mtvId, mtrId],
      });
    },
  });
}

export function useUpdateMotivationAlgorithmSettings(
  token: string,
  mtvId: string,
  mtrId: string,
  {
    type_algorithm_id,
    type_benchmark_id,
    value_benchmark,
  }: {
    type_algorithm_id: string;
    type_benchmark_id: string;
    value_benchmark: number;
  },
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => {
      return APIClient(token).put(
        `/v1/registry/motivations/${mtvId}/metric/${mtrId}`,
        {
          type_algorithm_id: type_algorithm_id,
          type_benchmark_id: type_benchmark_id,
          value_benchmark: value_benchmark,
        },
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["motivation-metrics"] });
      queryClient.invalidateQueries({ queryKey: ["all-metrics"] });
      queryClient.invalidateQueries({
        queryKey: ["motivation-metric-full", mtvId, mtrId],
      });
    },
    onError: (error: AxiosError) => {
      return handleBackendError(error);
    },
  });
}

export function useCreateMetricVersion(
  token: string,
  mtvId: string,
  mtrId: string,
  {
    label,
    description,
    type_algorithm_id,
    type_metric_id,
    type_benchmark_id,
    url,
    value_benchmark,
  }: MetricInput,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => {
      return APIClient(token).post(
        `/v1/registry/motivations/${mtvId}/metric/${mtrId}/version-metric`,
        {
          label: label,
          description: description,
          type_algorithm_id: type_algorithm_id,
          type_metric_id: type_metric_id,
          type_benchmark_id: type_benchmark_id,
          url: url,
          value_benchmark: value_benchmark,
        },
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["motivation-metrics"] });
      queryClient.invalidateQueries({ queryKey: ["all-metrics"] });
      queryClient.invalidateQueries({
        queryKey: ["motivation-metric-full", mtvId, mtrId],
      });
    },
    onError: (error: AxiosError) => {
      return handleBackendError(error);
    },
  });
}

export const useAssignPrinciplesToMotivation = (
  token: string,
  mtvId: string,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (principleAssignments: PrincipleAssignmentInput[]) => {
      const response = await APIClient(token).post<PrincipleResponse>(
        `/v1/registry/motivations/${mtvId}/principles`,
        principleAssignments,
      );
      return response.data;
    },
    onError: (error: AxiosError) => {
      return handleBackendError(error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["motivation-principles"] });
      queryClient.invalidateQueries({ queryKey: ["all-principles"] });
    },
  });
};

export const useCreateMotivationCriterion = (
  token: string,
  mtvId: string,
  { cri, label, description }: CriterionInput,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await APIClient(token).post<CriterionResponse>(
        `/v1/registry/motivations/${mtvId}/criterion`,
        {
          criterion_request: {
            cri,
            label,
            description,
            imperative: "must", // Default imperative
            type_criterion_id: "1", // Default type - you may want to make this configurable
          },
          relation: "maintainedBy", // Default relation
        },
      );
      return response.data;
    },

    onError: (error: AxiosError) => {
      return handleBackendError(error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["motivation-criteria"] });
      queryClient.invalidateQueries({ queryKey: ["all-criteria"] });
    },
  });
};

export const useGetMotivationAssessmentTypeTemplate = (
  mtvId: string,
  actId: string,
  token: string,
  isRegistered: boolean,
) =>
  useQuery({
    queryKey: ["assessment-type-template", mtvId, actId],
    queryFn: async () => {
      const response = await APIClient(token).get<Assessment>(
        `/v1/registry/motivations/${mtvId}/by-actor/${actId}/assessment-type-template`,
      );
      return response.data;
    },
    retry: (failureCount: number, error: unknown) => {
      if ((error as AxiosError)?.response?.status === 404) {
        return false;
      }
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
    enabled:
      !!token && isRegistered && mtvId !== undefined && actId !== undefined,
    refetchOnWindowFocus: false,
  });
