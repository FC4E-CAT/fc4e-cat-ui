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
  CriterionInput,
  CriterionResponse,
  CriterionTypeResponse,
  ImperativeResponse,
  Pagination,
  RegistryCriterion,
} from "@/types";

export const useGetCriteria = ({
  size,
  page,
  token,
  isRegistered,
  search,
  sortBy,
  sortOrder,
}: ApiOptionsSearch) =>
  useQuery({
    queryKey: ["criteria", { size, page, sortBy, sortOrder, search }],
    queryFn: async () => {
      let url = `/v1/registry/criteria?size=${size}&page=${page}&sort=${sortBy}&order=${sortOrder}`;
      if (search) url += `&search=${search}`;

      const response = await APIClient(token).get<CriterionResponse>(url);

      return response.data;
    },
    enabled: !!token && isRegistered,
  });

export const useGetCriterion = ({
  id,
  token,
  isRegistered,
}: {
  id: string;
  token: string;
  isRegistered: boolean;
}) =>
  useQuery({
    queryKey: ["criterion", id],
    queryFn: async () => {
      let response = null;

      response = await APIClient(token).get<RegistryCriterion>(
        `/v1/registry/criteria/${id}`,
      );
      return response.data;
    },
    enabled: !!token && isRegistered && id !== "" && id !== undefined,
  });

export const useGetAllCriteria = ({ token, isRegistered, size }: ApiOptions) =>
  useInfiniteQuery({
    queryKey: ["all-criteria"],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await APIClient(token).get<CriterionResponse>(
        `/v1/registry/criteria?size=${size}&page=${pageParam}`,
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

export const useGetAllImperatives = ({
  token,
  isRegistered,
  size,
}: ApiOptionsSearch) =>
  useInfiniteQuery({
    queryKey: ["all-imperatives"],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await APIClient(token).get<ImperativeResponse>(
        `/v1/registry/imperatives?size=${size}&page=${pageParam}`,
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

export const useCreateCriterion = (
  token: string,
  {
    cri,
    label,
    description,
    imperative,
    type_criterion_id,
    motivation_id,
  }: CriterionInput,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await APIClient(token).post<CriterionResponse>(
        `/v1/registry/criteria`,
        {
          cri,
          label,
          description,
          imperative,
          type_criterion_id,
          motivation_id,
        },
      );
      return response.data;
    },

    onError: (error: AxiosError) => {
      return handleBackendError(error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["criteria"] });
      queryClient.invalidateQueries({ queryKey: ["all-criteria"] });
    },
  });
};

export const useGetAllCriterionTypes = ({
  token,
  isRegistered,
  size,
}: ApiOptionsSearch) =>
  useInfiniteQuery({
    queryKey: ["motivation-types"],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await APIClient(token).get<CriterionTypeResponse>(
        `/v1/registry/criterion-types?size=${size}&page=${pageParam}`,
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

export const useUpdateCriterion = (
  token: string,
  id: string,
  { cri, label, description, imperative }: CriterionInput,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await APIClient(token).patch<CriterionResponse>(
        `/v1/registry/criteria/${id}`,
        {
          cri,
          label,
          description,
          imperative,
        },
      );
      return response.data;
    },
    onError: (error: AxiosError) => {
      return handleBackendError(error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["criterion", id] });
    },
  });
};

export function useDeleteCriterion(token: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (criterionId: string) => {
      return APIClient(token).delete(`/v1/registry/criteria/${criterionId}`);
    },
    // on success refresh criteria query (so that the deleted criterion dissapears from list)
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["criterion"] });
    },
  });
}
