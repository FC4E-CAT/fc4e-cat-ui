import { useNavigate } from "react-router-dom";
import { APIClient } from "@/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ApiOptions,
  Assessment,
  AssessmentDetailsResponse,
  AssessmentListResponse,
} from "@/types";
import { AxiosError } from "axios";
import { handleBackendError } from "@/utils";

export function useCreateAssessment(token: string) {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (postData: {
      validation_id: number;
      template_id: number;
      assessment_doc: Assessment;
    }) => {
      return APIClient(token).post("/assessments", postData);
    },
    // for the time being redirect to assessment list
    onSuccess: () => {
      navigate("/assessments");
    },
  });
}

export function useUpdateAssessment(
  token: string,
  assessmentID: string | undefined,
) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (putData: { assessment_doc: Assessment }) => {
      return APIClient(token).put(`/assessments/${assessmentID}`, putData);
    },
    // optimistically update the cached data
    onMutate: (newData) => {
      // Optimistically update the cache with the new data
      if (assessmentID) {
        queryClient.setQueryData(["assessment", assessmentID], newData);
      }
    },
    // for the time being redirect to assessment list
    onSuccess: () => {
      queryClient.invalidateQueries(["assessment", { assessmentID }]);
      navigate("/assessments");
    },
  });
}

export function useGetAssessments({
  size,
  page,
  sortBy,
  token,
  isRegistered,
}: ApiOptions) {
  return useQuery({
    queryKey: ["assessments", { size, page, sortBy }],
    queryFn: async () => {
      const response = await APIClient(token).get<AssessmentListResponse>(
        `/assessments?size=${size}&page=${page}&sortby=${sortBy}`,
      );
      return response.data;
    },
    onError: (error: AxiosError) => {
      return handleBackendError(error);
    },
    enabled: !!token && isRegistered,
  });
}

export function useGetPublicAssessments({
  size,
  page,
  sortBy,
  assessmentTypeId,
  actorId,
}: ApiOptions) {
  return useQuery({
    queryKey: ["public-owner-assessments", { size, page, sortBy }],
    queryFn: async () => {
      const response = await APIClient().get<AssessmentListResponse>(
        `/public/assessments/by-type/${assessmentTypeId}/by-actor/${actorId}?size=${size}&page=${page}&sortby=${sortBy}`,
      );
      return response.data;
    },
    onError: (error: AxiosError) => {
      return handleBackendError(error);
    },
  });
}

export function useGetAssessment({
  id,
  token,
  isRegistered,
}: {
  id: string;
  token: string;
  isRegistered: boolean;
}) {
  return useQuery({
    queryKey: ["assessment", id],
    queryFn: async () => {
      const response = await APIClient(token).get<AssessmentDetailsResponse>(
        `/assessments/${id}`,
      );
      return response.data;
    },
    onError: (error: AxiosError) => {
      return handleBackendError(error);
    },
    enabled: !!token && isRegistered && id !== "",
  });
}
