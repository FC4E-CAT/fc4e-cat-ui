import { AxiosError } from "axios";
import type { ApiOptions, Subject, SubjectListResponse } from "@/types";
import { APIClient } from "@/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { handleBackendError } from "@/utils";

// hook to get subjects by page
export const useGetSubjects = ({
  size,
  page,
  sortBy,
  token,
  isRegistered,
}: ApiOptions) =>
  useQuery({
    queryKey: ["subjects"],
    queryFn: async () => {
      const response = await APIClient(token).get<SubjectListResponse>(
        `/v1/subjects?size=${size}&page=${page}&sortby=${sortBy}`,
      );
      return response.data;
    },
    enabled: !!token && isRegistered,
  });

// hook to get specific subject
export function useGetSubject({
  id,
  token,
  isRegistered,
}: {
  id?: number;
  token?: string;
  isRegistered?: boolean;
}) {
  return useQuery({
    queryKey: ["subject", id],
    queryFn: async () => {
      const response = await APIClient(token).get<Subject>(
        `/v1/subjects/${id}`,
      );
      return response.data;
    },
    enabled: !!token && isRegistered && !!id && id > 0,
  });
}

// hook to create new subject
export function useCreateSubject(token: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postData: {
      subject_id: string;
      name: string;
      type: string;
    }) => {
      return APIClient(token).post("/v1/subjects", postData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    },
  });
}

export function useUpdateSubject(token: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Subject) => {
      const response = await APIClient(token).patch<Subject>(
        `/v1/subjects/${data.id}`,
        data,
      );
      if (response.status == 200) {
        queryClient.invalidateQueries({ queryKey: ["subjects"] });
        queryClient.invalidateQueries({ queryKey: ["subject", data.id] });
      }
      return response.data;
    },

    onError: (error: AxiosError) => {
      return handleBackendError(error);
    },
  });
}

export function useDeleteSubject(token: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await APIClient(token).delete(`/v1/subjects/${id}`);
      if (response.status == 200) {
        queryClient.invalidateQueries({ queryKey: ["subjects"] });
        queryClient.invalidateQueries({ queryKey: ["subject", id] });
      }
      return response.data;
    },
    onError: (error: AxiosError) => {
      return handleBackendError(error);
    },
  });
}
