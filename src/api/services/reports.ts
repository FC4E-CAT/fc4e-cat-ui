import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { APIClient } from "../client";
import type {
  ApiAdminAssessments,
  AssessmentDetailsResponse,
  AssessmentListResponse,
  Pagination,
} from "@/types";

export interface ReportDefinition {
  id: string;
  label: string;
  description: string;
  value_type: string;
  row_dimension: string;
  column_dimension: string;
}

export interface ReportRequest {
  filters: Record<string, string | number | boolean | string[]>;
}

export interface ReportResponse {
  label: string;
  description: string;
  rows_dimension: string;
  columns_dimension: string;
  value_type: string;
  created_by: string;
  created_on: string;
  rows: string[];
  columns: string[];
  data: string[][];
}

export interface FilterValue {
  id: string;
  label: string;
}

export interface FilterDefinition {
  name: string;
  type: string;
  required: boolean;
}

export interface ReportFilter {
  definition: FilterDefinition;
  values: FilterValue[];
}

export const useGetReportDefinitions = ({
  token,
  isRegistered,
}: {
  token: string;
  isRegistered: boolean;
}) =>
  useQuery({
    queryKey: ["report-definitions"],
    queryFn: async () => {
      const response = await APIClient(token).get<ReportDefinition[]>(
        "/v1/reports/definitions",
      );
      return response.data;
    },
    enabled: !!token && isRegistered,
  });

export const useGenerateReport = (token: string) => {
  return useMutation({
    mutationFn: async ({
      reportId,
      reportRequest,
    }: {
      reportId: string;
      reportRequest?: ReportRequest;
    }) => {
      const response = await APIClient(token).post<ReportResponse>(
        `/v1/reports/generate/${reportId}`,
        reportRequest,
      );
      return response.data;
    },
  });
};

export const useExportReport = (token: string) => {
  return useMutation({
    mutationFn: async ({
      reportId,
      reportData,
    }: {
      reportId: string;
      reportData: ReportResponse;
    }) => {
      const response = await APIClient(token).post(
        `/v1/reports/export/${reportId}`,
        reportData,
        {
          responseType: "blob",
          headers: {
            Accept: "text/csv",
          },
        },
      );

      return {
        data: response.data,
        headers: response.headers,
      };
    },
  });
};

export const useGetReportFilters = ({
  reportDefinitionId,
  token,
  isRegistered,
}: {
  reportDefinitionId: string;
  token: string;
  isRegistered: boolean;
}) =>
  useQuery({
    queryKey: ["report-filters", reportDefinitionId],
    queryFn: async () => {
      const response = await APIClient(token).get<ReportFilter[]>(
        `/v1/reports/filters/by-report-definition/${reportDefinitionId}`,
      );
      return response.data;
    },
    enabled: !!token && !!reportDefinitionId && isRegistered,
  });

export const useGetReportAssessments = ({
  size,
  token,
  search,
  isRegistered,
}: ApiAdminAssessments) =>
  useInfiniteQuery({
    queryKey: ["all-assessments", { size, search }],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await APIClient(token).get<AssessmentListResponse>(
        `/v1/reports/assessments?size=${size}&page=${pageParam}${search !== "" ? "&search=" + search : ""}`,
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
    enabled: !!token && isRegistered,
  });

export function useGetReportAssessmentById({
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
      const url = `/v1/reports/assessments/${id}`;
      const response =
        await APIClient(token).get<AssessmentDetailsResponse>(url);
      return response.data;
    },
    enabled: !!token && isRegistered && id !== "",
  });
}
