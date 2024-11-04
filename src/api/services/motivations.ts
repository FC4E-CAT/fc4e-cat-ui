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
  ApiMotivations,
  ApiOptions,
  CriImp,
  ImperativeResponse,
  Motivation,
  MotivationActorResponse,
  MotivationInput,
  MotivationResponse,
  MotivationTypeResponse,
  PrincipleResponse,
  RelationResponse,
} from "@/types";
import { CriterionResponse } from "@/types/criterion";

export const useGetMotivations = ({
  size,
  page,
  sortBy,
  sortOrder,
  token,
  isRegistered,
  search,
}: ApiMotivations) =>
  useQuery({
    queryKey: ["motivations", { size, page, sortBy }],
    queryFn: async () => {
      const response = await APIClient(token).get<MotivationResponse>(
        `/registry/motivations?size=${size}&page=${page}&sort=${sortBy}&order=${sortOrder}${search ? "&search=" + search : ""}`,
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
    queryKey: ["motivation", id],
    queryFn: async () => {
      let response = null;

      response = await APIClient(token).get<Motivation>(
        `/registry/motivations/${id}`,
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

export const useGetAllActors = ({ token, isRegistered, size }: ApiOptions) =>
  useInfiniteQuery({
    queryKey: ["all-actors"],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await APIClient(token).get<MotivationActorResponse>(
        `/registry/actors?size=${size}&page=${pageParam}`,
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

export const useGetAllPrinciples = ({
  token,
  isRegistered,
  size,
}: ApiOptions) =>
  useInfiniteQuery({
    queryKey: ["all-principles"],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await APIClient(token).get<PrincipleResponse>(
        `/registry/principles?size=${size}&page=${pageParam}`,
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

export const useGetAllImperatives = ({
  token,
  isRegistered,
  size,
}: ApiOptions) =>
  useInfiniteQuery({
    queryKey: ["all-imperatives"],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await APIClient(token).get<ImperativeResponse>(
        `/registry/imperatives?size=${size}&page=${pageParam}`,
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
        `/registry/relations?size=${size}&page=${pageParam}`,
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
        `/registry/motivations`,
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

export const useUpdateMotivation = (
  token: string,
  id: string,
  { mtv, label, description, motivation_type_id }: MotivationInput,
) => {
  const queryClient = useQueryClient();
  return useMutation(
    async () => {
      const response = await APIClient(token).patch<MotivationResponse>(
        `/registry/motivations/${id}`,
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
        queryClient.invalidateQueries(["motivation", id]);
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
        `/registry/motivations/${motivationId}/actors`,
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
        queryClient.invalidateQueries(["motivation", motivationId]);
      },
    },
  );
};

export const useGetMotivationPrinciples = (
  mtvId: string,
  { token, isRegistered, size }: ApiOptions,
) =>
  useInfiniteQuery({
    queryKey: ["motivation-principles"],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await APIClient(token).get<PrincipleResponse>(
        `/registry/motivations/${mtvId}/principles?size=${size}&page=${pageParam}`,
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
        `/registry/motivations/${mtvId}/criteria?size=${size}&page=${pageParam}`,
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

export const useGetMotivationActorCriteria = (
  mtvId: string,
  actId: string,
  { token, isRegistered, size }: ApiOptions,
) =>
  useInfiniteQuery({
    queryKey: ["motivation-actor-criteria"],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await APIClient(token).get<CriterionResponse>(
        `/registry/motivations/${mtvId}/actors/${actId}/criteria?size=${size}&page=${pageParam}`,
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

export function useUpdateMotivationActorCriteria(
  token: string,
  mtvId: string,
  actId: string,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (putData: CriImp[]) => {
      return APIClient(token).put(
        `/registry/motivations/${mtvId}/actors/${actId}/criteria`,
        putData,
      );
    },
    // on change refresh motivation-actor-criteria list
    onSuccess: () => {
      queryClient.invalidateQueries(["motivation-actor-criteria"]);
    },
  });
}
