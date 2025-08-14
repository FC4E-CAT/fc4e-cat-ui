import { useNavigate } from "react-router-dom";
import { APIClient } from "@/api";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type {
  ApiOptions,
  Assessment,
  AssessmentDetailsResponse,
  AssessmentListResponse,
  AssessmentSubjectListResponse,
  AssessmentTypeResponse,
  SharedUsers,
  AssessmentCommentResponse,
  ApiAssessments,
  ApiObjects,
  ApiAdminAssessments,
  Pagination,
} from "@/types";
import ROUTES from "@/routes";

export function useCreateAssessment(token: string) {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (postData: { assessment_doc: Assessment }) => {
      return APIClient(token).post("/v2/assessments", postData);
    },
    // for the time being redirect to assessment list
    onSuccess: (resp) => {
      const respData = resp as { data: { id?: string } };
      if (respData.data.id) {
        navigate(`${ROUTES.ASSESSMENTS.ROOT}/${respData.data.id}#assessment`);
      } else {
        // fallback if ID isn't returned for some reason
        navigate(ROUTES.ASSESSMENTS.ROOT);
      }
    },
  });
}

export function useDeleteAssessment(token: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (assessmentId: string) => {
      return APIClient(token).delete(`/v2/assessments/${assessmentId}`);
    },
    // on success refresh assessments query (so that the deleted assessment dissapears from list)
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assessments"] });
    },
  });
}

export function useAdminDeleteAssessment(token: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (assessmentId: string) => {
      return APIClient(token).delete(`/v1/admin/assessments/${assessmentId}`);
    },
    // on success refresh assessments query (so that the deleted assessment dissapears from list)
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assessments"] });
    },
  });
}

export function useUpdateAssessment(
  token: string,
  assessmentID: string | undefined,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (putData: { assessment_doc: Assessment }) => {
      return APIClient(token).put(`/v2/assessments/${assessmentID}`, putData);
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
      queryClient.invalidateQueries({
        queryKey: ["assessment", { assessmentID }],
      });
    },
  });
}

export const useGetAssessments = ({
  size,
  page,
  token,
  isRegistered,
  subject_name,
  subject_type,
  isPublic,
  actorId,
  motivationId,
}: ApiAssessments) =>
  useQuery({
    queryKey: ["assessments"],
    queryFn: async () => {
      let url = isPublic
        ? motivationId == ""
          ? `/v2/assessments/by-actor/${actorId}?size=${size}&page=${page}`
          : `/v2/assessments/by-motivation/${motivationId}/by-actor/${actorId}?size=${size}&page=${page}`
        : `/v2/assessments?size=${size}&page=${page}`;

      if (subject_name) url += `&subject_name=${subject_name}`;
      if (subject_type) url += `&subject_type=${subject_type}`;

      const response = await APIClient(
        isPublic ? "" : token,
      ).get<AssessmentListResponse>(url);
      return response.data;
    },
    enabled: isPublic || (!!token && isRegistered),
  });

export function useGetAssessmentShares({
  id,
  token,
  isRegistered,
}: {
  id: string;
  token?: string;
  isRegistered?: boolean;
}) {
  return useQuery({
    queryKey: ["assessment-shares", id],
    queryFn: async () => {
      const url = `/v1/assessments/${id}/shared-users`;
      const response = await APIClient(token).get<SharedUsers>(url);
      return response.data;
    },
    enabled: (!!token && isRegistered && id !== "") || id !== "",
  });
}

// share Assessment

export function useShareAssessment(token: string, id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postData: { shared_with_user: string }) => {
      return APIClient(token).post(`/v1/assessments/${id}/share`, postData);
    },
    // for the time being redirect to assessment list
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assessment-shares", id] });
      queryClient.invalidateQueries({ queryKey: ["assessments"] });
    },
  });
}

// works for public and private assessments
export function useGetAssessment({
  id,
  isPublic,
  token,
  isRegistered,
}: {
  id: string;
  isPublic: boolean;
  token?: string;
  isRegistered?: boolean;
}) {
  return useQuery({
    queryKey: ["assessment", id],
    queryFn: async () => {
      let url: string;
      if (isPublic) {
        url = `/v2/assessments/public/${id}`;
      } else {
        url = `/v2/assessments/${id}`;
      }
      const response =
        await APIClient(token).get<AssessmentDetailsResponse>(url);
      return response.data;
    },
    enabled:
      (isPublic && id !== "") ||
      (!!token && isRegistered && id !== "") ||
      id !== "",
  });
}

export function useGetAdminAssessment({
  id,
  token,
  isRegistered,
}: {
  id: string;
  token?: string;
  isRegistered?: boolean;
}) {
  return useQuery({
    queryKey: ["assessment", id],
    queryFn: async () => {
      const response = await APIClient(token).get<AssessmentDetailsResponse>(
        `/v1/admin/assessments/${id}`,
      );
      return response.data;
    },
    enabled: (!!token && isRegistered && id !== "") || id !== "",
  });
}

export const useGetAdminAssessments = ({
  size,
  page,
  token,
  isRegistered,
  search,
}: ApiAdminAssessments) =>
  useQuery({
    queryKey: ["assessments"],
    queryFn: async () => {
      const response = await APIClient(token).get<AssessmentListResponse>(
        `/v1/admin/assessments?size=${size}&page=${page}${search !== "" ? "&search=" + search : ""}`,
      );
      return response.data;
    },
    enabled: !!token && isRegistered,
  });

export function useGetAdminAssessmentById({
  id,
  token,
  isRegistered,
}: {
  id: string;
  token?: string;
  isRegistered?: boolean;
}) {
  return useQuery({
    queryKey: ["assessment", id],
    queryFn: async () => {
      const url = `/v1/admin/assessments/${id}`;
      const response =
        await APIClient(token).get<AssessmentDetailsResponse>(url);
      return response.data;
    },
    enabled: !!token && isRegistered && id !== "",
  });
}

export function useGetObjects({
  size,
  page,
  token,
  assessmentTypeId,
  actorId,
}: ApiObjects) {
  const url = actorId
    ? `/v2/assessments/public-objects/by-motivation/${assessmentTypeId}/by-actor/${actorId}?size=${size}&page=${page}`
    : `/v2/assessments/objects?size=${size}&page=${page}`;

  return useQuery({
    queryKey: ["objects"],
    queryFn: async () => {
      const response = await APIClient(
        actorId ? "" : token,
      ).get<AssessmentSubjectListResponse>(url);
      return response.data;
    },
  });
}

export function useGetAssessmentTypes({
  token,
  isRegistered,
}: {
  token?: string;
  isRegistered?: boolean;
}) {
  return useQuery({
    queryKey: ["assessmentTypes"],
    queryFn: async () => {
      const url = `/v1/codelist/assessment-types?size=100&page=1`;
      const response = await APIClient(token).get<AssessmentTypeResponse>(url);
      return response.data.content;
    },
    enabled: isRegistered,
  });
}

// use infinite query to get all the comments for a specific assessment given it's id
export const useGetAssessmentComments = (
  id: string,
  { token, isRegistered, size }: ApiOptions,
) =>
  useInfiniteQuery({
    queryKey: ["assessment-comments", id],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await APIClient(token).get<AssessmentCommentResponse>(
        `/v1/assessments/${id}/comments?size=${size}&page=${pageParam}`,
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

// use mutation to add a new comment to assessment with specific id
export function useAssessmentCommentAdd(token: string, id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postData: { text: string }) => {
      return APIClient(token).post(`/v1/assessments/${id}/comments`, postData);
    },
    // update query cache
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assessment-comments", id] });
    },
  });
}

// use mutation to update a comment with cid, included in an assessment with specific id
export function useAssessmentCommentUpdate(
  token: string,
  id: string,
  cid: number,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (putData: { text: string }) => {
      return APIClient(token).put(
        `/v1/assessments/${id}/comments/${cid}`,
        putData,
      );
    },
    // update query cache
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assessment-comments", id] });
    },
  });
}

// use mutation to delete a comment with cid, included in an assessment with specific id
export function useAssessmentCommentDelete(
  token: string,
  id: string,
  cid: number,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => {
      return APIClient(token).delete(`/v1/assessments/${id}/comments/${cid}`);
    },
    // update query cache
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assessment-comments", id] });
    },
  });
}

// use mutation to publish an assessment either as admin or plain user
export function useAssessmentPublish(
  token: string,
  id: string,
  admin: boolean,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => {
      console.log("published:", id);
      return APIClient(token).put(
        `${admin ? "/v1/admin" : "/v2"}/assessments/${id}/publish`,
      );
    },
    // update query cache
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assessments"] });
      queryClient.invalidateQueries({ queryKey: ["assessment", { id }] });
    },
  });
}

// use mutation to unpublish an assessment either as admin or plain user
export function useAssessmentUnpublish(
  token: string,
  id: string,
  admin: boolean,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => {
      return APIClient(token).put(
        `${admin ? "/v1/admin" : "/v2"}/assessments/${id}/unpublish`,
      );
    },
    // update query cache
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assessments"] });
      queryClient.invalidateQueries({ queryKey: ["assessment", { id }] });
    },
  });
}
