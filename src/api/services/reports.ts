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
  reportDefinitionId: string;
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
    mutationFn: async (reportRequest: ReportRequest) => {
      const response = await APIClient(token).post<ReportResponse>(
        "/v1/reports",
        reportRequest,
      );
      return response.data;
    },
  });
};
