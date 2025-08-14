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
  Pagination,
  Principle,
  PrincipleInput,
  PrincipleResponse,
} from "@/types";

export const useGetPrinciples = ({
  size,
  page,
  token,
  sortBy,
  sortOrder,
  search,
  isRegistered,
}: ApiOptionsSearch) =>
  useQuery({
    queryKey: ["principles", { size, page, sortBy, sortOrder, search }],
    queryFn: async () => {
      let url = `/v1/registry/principles?size=${size}&page=${page}&sort=${sortBy}&order=${sortOrder}`;
      if (search) url += `&search=${search}`;

      const response = await APIClient(token).get<PrincipleResponse>(url);

      return response.data;
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
    queryKey: ["principle", id],
    queryFn: async () => {
      let response = null;

      response = await APIClient(token).get<Principle>(
        `/v1/registry/principles/${id}`,
      );
      return response.data;
    },
    enabled: !!token && isRegistered && id !== "" && id !== undefined,
  });

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

export const useCreatePrinciple = (
  token: string,
  { pri, label, description }: PrincipleInput,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await APIClient(token).post<PrincipleResponse>(
        `/v1/registry/principles`,
        {
          pri,
          label,
          description,
        },
      );
      return response.data;
    },

    onError: (error: AxiosError) => {
      return handleBackendError(error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["principles"] });
    },
  });
};

export const useUpdatePrinciple = (
  token: string,
  id: string,
  { pri, label, description }: PrincipleInput,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await APIClient(token).patch<PrincipleResponse>(
        `/v1/registry/principles/${id}`,
        {
          pri,
          label,
          description,
        },
      );
      return response.data;
    },
    onError: (error: AxiosError) => {
      return handleBackendError(error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["principle", id] });
      queryClient.invalidateQueries({ queryKey: ["principles"] });
    },
  });
};

export function useDeletePrinciple(token: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (principleId: string) => {
      return APIClient(token).delete(`/v1/registry/principles/${principleId}`);
    },
    // on success refresh principles query (so that the deleted principle dissapears from list)
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["principles"] });
    },
  });
}
