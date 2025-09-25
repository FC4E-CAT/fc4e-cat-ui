import { useMutation, useQuery } from "@tanstack/react-query";
import { APIClient } from "../client";

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
