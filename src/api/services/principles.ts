import { AxiosError } from "axios";
import { APIClient } from "@/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { handleBackendError } from "@/utils";
import {
  ApiOptions,
  Principle,
  PrincipleInput,
  PrincipleResponse,
} from "@/types";

export const useGetPrinciples = ({
  size,
  page,
  token,
  isRegistered,
}: ApiOptions) =>
  useQuery({
    queryKey: ["principles", { size, page }],
    queryFn: async () => {
      const response = await APIClient(token).get<PrincipleResponse>(
        `/registry/principles?size=${size}&page=${page}`,
      );
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
    queryKey: ["principle", id],
    queryFn: async () => {
      let response = null;

      response = await APIClient(token).get<Principle>(
        `/registry/principles/${id}`,
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
  { pri, label, description }: PrincipleInput,
) => {
  const queryClient = useQueryClient();
  return useMutation(
    async () => {
      const response = await APIClient(token).post<PrincipleResponse>(
        `/registry/principles`,
        {
          pri,
          label,
          description,
        },
      );
      return response.data;
    },

    {
      onError: (error: AxiosError) => {
        return handleBackendError(error);
      },
      onSuccess: () => {
        queryClient.invalidateQueries(["principles"]);
      },
    },
  );
};

export const useUpdatePrinciple = (
  token: string,
  id: string,
  { pri, label, description }: PrincipleInput,
) => {
  const queryClient = useQueryClient();
  return useMutation(
    async () => {
      const response = await APIClient(token).patch<PrincipleResponse>(
        `/registry/principles/${id}`,
        {
          pri,
          label,
          description,
        },
      );
      return response.data;
    },

    {
      onError: (error: AxiosError) => {
        return handleBackendError(error);
      },
      onSuccess: () => {
        queryClient.invalidateQueries(["principle", id]);
      },
    },
  );
};

export function useDeletePrinciple(token: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (principleId: string) => {
      return APIClient(token).delete(`/registry/principles/${principleId}`);
    },
    // on success refresh principles query (so that the deleted principle dissapears from list)
    onSuccess: () => {
      queryClient.invalidateQueries(["principles"]);
    },
  });
}
