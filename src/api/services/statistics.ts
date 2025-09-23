import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { APIClient } from "@/api";
import type { Pagination } from "@/types";

export interface UserStatistics {
  total_users: number;
  validated_users: number;
  banned_users: number;
  identified_users: number;
}

export interface AssessmentStatistics {
  total_assessments: number;
  public_assessments: number;
  private_assessments: number;
  assessment_per_role: Array<{
    total_assessments: number;
    actor: string;
  }>;
}

export interface ValidationStatistics {
  total_validations: number;
  accepted_validations: number;
  pending_validations: number;
  rejected_validations: number;
}

export interface MostFailedCriteria {
  id: string;
  cri: string;
  label: string;
  fail_count: number;
  failure_percentage: number;
  used_in_assessments: number;
}

export interface MostFailedCriteriaResponse {
  size_of_page: number;
  number_of_page: number;
  total_elements: number;
  total_pages: number;
  links: Array<{
    href: string;
    rel: string;
  }>;
  content: MostFailedCriteria[];
}

export interface AdminStatistics {
  user_statistics: UserStatistics;
  assessment_statistics: AssessmentStatistics;
  validation_statistics: ValidationStatistics;
}

export const useGetAdminStatistics = ({
  token,
  isRegistered,
}: {
  token?: string;
  isRegistered?: boolean;
}) =>
  useQuery({
    queryKey: ["admin-statistics"],
    queryFn: async () => {
      const response = await APIClient(token).get<AdminStatistics>(
        "/v1/admin/statistics",
      );
      return response.data;
    },
    enabled: !!token && isRegistered,
    refetchInterval: 30000,
  });

export const useGetMostFailedCriteria = ({
  size,
  token,
  isRegistered,
}: {
  size?: number;
  token?: string;
  isRegistered?: boolean;
}) =>
  useInfiniteQuery({
    queryKey: ["most-failed-criteria"],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await APIClient(token).get<MostFailedCriteriaResponse>(
        `/v1/admin/statistics/criteria/most-failed?size=${size}&page=${pageParam}`,
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
    enabled: !!token && isRegistered,
  });
