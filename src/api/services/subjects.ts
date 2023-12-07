import { AxiosError } from "axios";
import { ActorListResponse, ApiOptions } from "@/types";
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
      const response = await APIClient(token).get<ActorListResponse>(
        `/subjects?size=${size}&page=${page}&sortby=${sortBy}`,
      );
      return response.data;
    },
    onError: (error: AxiosError) => {
      return handleBackendError(error);
    },
    enabled: !!token && isRegistered,
  });

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
