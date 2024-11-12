import { AxiosError } from "axios";
import { Assessment, TemplateResponse } from "@/types";
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
    queryKey: ["template", templateTypeId],
    queryFn: async () => {
      const response = await APIClient(token).get<TemplateResponse>(
        `/v1/templates/by-type/${templateTypeId}/by-actor/${actorId}`,
      );
      return response.data;
    },
    onError: (error: AxiosError) => {
      return handleBackendError(error);
    },
    enabled: !!token && isRegistered && actorId !== undefined,
    refetchOnWindowFocus: false,
  });

export const useGetMotivationTemplate = (
  mtvId: string,
  actId: string,
  token: string,
  isRegistered: boolean,
) =>
  useQuery({
    queryKey: ["assessment-type", mtvId, actId],
    queryFn: async () => {
      const response = await APIClient(token).get<Assessment>(
        `/v1/templates/by-motivation/${mtvId}/by-actor/${actId}`,
      );
      return response.data;
    },
    onError: (error: AxiosError) => {
      return handleBackendError(error);
    },
    enabled: !!token && isRegistered && mtvId !== "" && actId !== "",
    refetchOnWindowFocus: false,
  });

export const useGetMotivationAssessmentType = (
  mtvId: string,
  actId: string,
  token: string,
  isRegistered: boolean,
) =>
  useQuery({
    queryKey: ["assessment-type", mtvId, actId],
    queryFn: async () => {
      const response = await APIClient(token).get<Assessment>(
        `/v1/registry/motivations/${mtvId}/by-actor/${actId}/template`,
      );
      return response.data;
    },
    onError: (error: AxiosError) => {
      return handleBackendError(error);
    },
    enabled:
      !!token && isRegistered && mtvId !== undefined && actId !== undefined,
    refetchOnWindowFocus: false,
  });
