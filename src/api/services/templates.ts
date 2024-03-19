import { AxiosError } from "axios";
import { TemplateResponse } from "@/types";
import { APIClient } from "@/api";
import { useQuery } from "@tanstack/react-query";
import { handleBackendError } from "@/utils";

/** Backend calls for getting Assessment Template */
export const useGetTemplate = (
  templateTypeId: number,
  actorId: number | undefined,
  token: string,
  isRegistered: boolean,
) =>
  useQuery({
    queryKey: ["template", actorId],
    queryFn: async () => {
      const response = await APIClient(token).get<TemplateResponse>(
        `/templates/by-type/${templateTypeId}/by-actor/${actorId}`,
      );
      return response.data;
    },
    onError: (error: AxiosError) => {
      return handleBackendError(error);
    },
    enabled: !!token && isRegistered && actorId !== undefined,
    refetchOnWindowFocus: false,
  });
