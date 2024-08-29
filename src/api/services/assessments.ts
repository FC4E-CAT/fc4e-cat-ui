import { useNavigate } from "react-router-dom";
import { APIClient } from "@/api";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  ApiOptions,
  Assessment,
  AssessmentDetailsResponse,
  AssessmentFiltersType,
  AssessmentListResponse,
  AssessmentSubjectListResponse,
  AssessmentAdminDetailsResponse,
  AssessmentTypeResponse,
  SharedUsers,
  AssessmentCommentResponse,
} from "@/types";
import { AxiosError } from "axios";
import { handleBackendError } from "@/utils";

export function useCreateAssessment(token: string) {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (postData: { assessment_doc: Assessment }) => {
      return APIClient(token).post("/assessments", postData);
    },
    // for the time being redirect to assessment list
    onSuccess: () => {
      navigate("/assessments");
    },
  });
}

export function useDeleteAssessment(token: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (assessmentId: string) => {
      return APIClient(token).delete(`/assessments/${assessmentId}`);
    },
    // on success refresh assessments query (so that the deleted assessment dissapears from list)
    onSuccess: () => {
      queryClient.invalidateQueries(["assessments"]);
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
    },
  });
}

export function useGetAssessments({
  size,
  page,
  sortBy,
  token,
  isRegistered,
  ...filters
}: ApiOptions & AssessmentFiltersType) {
  let url = `/assessments?size=${size}&page=${page}&sortby=${sortBy}`;
  Object.keys(filters).forEach((k: string) => {
    if (filters[k as keyof typeof filters] !== "") {
      url = url.concat(`&${k}=${filters[k as keyof typeof filters]}`);
    }
  });
  return useQuery({
    queryKey: ["assessments", { size, page, sortBy, ...filters }],
    queryFn: async () => {
      const response = await APIClient(token).get<AssessmentListResponse>(url);
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
  ...filters
}: ApiOptions) {
  let url = `/assessments/by-type/${assessmentTypeId}/by-actor/${actorId}?size=${size}&page=${page}&sortby=${sortBy}`;
  Object.keys(filters).forEach((k: string) => {
    if (filters[k as keyof typeof filters] !== "") {
      url = url.concat(`&${k}=${filters[k as keyof typeof filters]}`);
    }
  });
  return useQuery({
    queryKey: [
      "public-owner-assessments",
      { size, page, sortBy, assessmentTypeId, actorId, ...filters },
    ],
    queryFn: async () => {
      const response = await APIClient().get<AssessmentListResponse>(url);
      return response.data;
    },
    onError: (error: AxiosError) => {
      return handleBackendError(error);
    },
    enabled: !!actorId && actorId > 0,
  });
}

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
      const url = `/assessments/${id}/shared-users`;
      const response = await APIClient(token).get<SharedUsers>(url);
      return response.data;
    },
    onError: (error: AxiosError) => {
      return handleBackendError(error);
    },
    enabled: (!!token && isRegistered && id !== "") || id !== "",
  });
}

// share Assessment

export function useShareAssessment(token: string, id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postData: { shared_with_user: string }) => {
      return APIClient(token).post(`/assessments/${id}/share`, postData);
    },
    // for the time being redirect to assessment list
    onSuccess: () => {
      queryClient.invalidateQueries(["assessment-shares", id]);
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
        url = `/assessments/public/${id}`;
      } else {
        url = `/assessments/${id}`;
      }
      const response =
        await APIClient(token).get<AssessmentDetailsResponse>(url);
      return response.data;
    },
    onError: (error: AxiosError) => {
      return handleBackendError(error);
    },
    enabled:
      (isPublic && id !== "") ||
      (!!token && isRegistered && id !== "") ||
      id !== "",
  });
}

export function useGetAdminAssessment({
  token,
  isRegistered,
}: {
  token?: string;
  isRegistered?: boolean;
}) {
  return useQuery({
    queryKey: ["assessment"],
    queryFn: async () => {
      let page = 1;
      let allData: AssessmentAdminDetailsResponse["content"] = [];
      let totalPages = 1;

      do {
        const url = `/admin/assessments?page=${page}&size=10`;
        const response =
          await APIClient(token).get<AssessmentAdminDetailsResponse>(url);
        const data = response.data;

        allData = allData.concat(data.content);
        totalPages = data.total_pages;
        page += 1;
      } while (page <= totalPages);

      return allData;
    },
    onError: (error: AxiosError) => {
      return handleBackendError(error);
    },
    enabled: !!token && isRegistered,
  });
}

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
      const url = `/admin/assessments/${id}`;
      const response =
        await APIClient(token).get<AssessmentDetailsResponse>(url);
      return response.data;
    },
    onError: (error: AxiosError) => {
      return handleBackendError(error);
    },
    enabled: !!token && isRegistered && id !== "",
  });
}

export function useGetObjectsByActor({
  size,
  page,
  sortBy,
  token,
  isRegistered,
  actorId,
}: ApiOptions) {
  return useQuery({
    queryKey: ["objects", { size, page, sortBy, actorId }],
    queryFn: async () => {
      if (actorId && actorId > 0) {
        const response = await APIClient(
          token,
        ).get<AssessmentSubjectListResponse>(
          `/assessments/objects/by-actor/${actorId}?size=${size}&page=${page}&sortby=${sortBy}`,
        );
        return response.data;
      } else return { content: [] };
    },
    onError: (error: AxiosError) => {
      return handleBackendError(error);
    },
    enabled: !!token && isRegistered && !!actorId && actorId > 0,
  });
}

export function useGetObjects({
  size,
  page,
  token,
  assessmentTypeId,
  actorId,
}: ApiOptions) {
  let url = "/assessments";
  if (actorId && actorId > 0) {
    url = url.concat(
      `/public-objects/by-type/${assessmentTypeId}/by-actor/${actorId}?size=${size}&page=${page}`,
    );
  } else {
    url = url.concat(`/objects?size=${size}&page=${page}`);
  }

  return useQuery({
    queryKey: ["objects", { size, page, assessmentTypeId, actorId }],
    queryFn: async () => {
      const response =
        await APIClient(token).get<AssessmentSubjectListResponse>(url);
      return response.data;
    },
    onError: (error: AxiosError) => {
      return handleBackendError(error);
    },
    enabled: !!actorId,
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
      const url = `/codelist/assessment-types?size=100&page=1`;
      const response = await APIClient(token).get<AssessmentTypeResponse>(url);
      return response.data.content;
    },
    onError: (error: AxiosError) => {
      return handleBackendError(error);
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
        `/assessments/${id}/comments?size=${size}&page=${pageParam}`,
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

// use mutation to add a new comment to assessment with specific id
export function useAssessmentCommentAdd(token: string, id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postData: { text: string }) => {
      return APIClient(token).post(`/assessments/${id}/comments`, postData);
    },
    // update query cache
    onSuccess: () => {
      queryClient.invalidateQueries(["assessment-comments", id]);
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
        `/assessments/${id}/comments/${cid}`,
        putData,
      );
    },
    // update query cache
    onSuccess: () => {
      queryClient.invalidateQueries(["assessment-comments", id]);
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
      return APIClient(token).delete(`/assessments/${id}/comments/${cid}`);
    },
    // update query cache
    onSuccess: () => {
      queryClient.invalidateQueries(["assessment-comments", id]);
    },
  });
}
