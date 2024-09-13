import { AxiosError } from "axios";
import { APIClient } from "@/api";
import { useQuery } from "@tanstack/react-query";
import { handleBackendError } from "@/utils";
import { ApiOptions, MotivationResponse } from "@/types";

export const useGetMotivations = ({
  size,
  page,
  token,
  isRegistered,
}: ApiOptions) =>
  useQuery({
    queryKey: ["motivations", { size, page }],
    queryFn: async () => {
      const response = await APIClient(token).get<MotivationResponse>(
        `/registry/motivations?size=${size}&page=${page}`,
      );
      return response.data;
    },
    onError: (error: AxiosError) => {
      return handleBackendError(error);
    },
    enabled: !!token && isRegistered,
  });
