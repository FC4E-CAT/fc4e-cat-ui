import { useQuery } from "@tanstack/react-query";
import { APIClient } from "@/api";

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
