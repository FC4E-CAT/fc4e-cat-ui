import { AxiosError } from "axios";
import { ApiOptions, Subject, SubjectListResponse } from "@/types";
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
        `/subjects?size=${size}&page=${page}&sortby=${sortBy}`,
      );
      return response.data;
    },
    onError: (error: AxiosError) => {
      return handleBackendError(error);
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
      const response = await APIClient(token).get<Subject>(`/subjects/${id}`);
      return response.data;
    },
    onError: (error: AxiosError) => {
      return handleBackendError(error);
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
      return APIClient(token).post("/subjects", postData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["subjects"]);
    },
  });
}

export function useUpdateSubject(token: string) {
  const queryClient = useQueryClient();
  return useMutation(
    async (data: Subject) => {
      const response = await APIClient(token).patch<Subject>(
        `/subjects/${data.id}`,
        data,
      );
      if (response.status == 200) {
        queryClient.invalidateQueries(["subjects"]);
        queryClient.invalidateQueries(["subject", data.id]);
      }
      return response.data;
    },
    {
      onError: (error: AxiosError) => {
        return handleBackendError(error);
      },
    },
  );
}

export function useDeleteSubject(token: string) {
  const queryClient = useQueryClient();
  return useMutation(
    async (id: number) => {
      const response = await APIClient(token).delete(`/subjects/${id}`);
      if (response.status == 200) {
        queryClient.invalidateQueries(["subjects"]);
        queryClient.invalidateQueries(["subject", id]);
      }
      return response.data;
    },
    {
      onError: (error: AxiosError) => {
        return handleBackendError(error);
      },
    },
  );
}
