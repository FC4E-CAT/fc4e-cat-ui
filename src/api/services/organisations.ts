import { AxiosError } from "axios";
import {
  OrganisationRORSearchParams,
  OrganisationRORSearchResponse,
} from "@/types";
import { APIClient } from "@/api";
import { useQuery } from "@tanstack/react-query";
import { handleBackendError } from "@/utils";

export const useOrganisationRORSearch = ({
  name,
  page,
  token,
}: OrganisationRORSearchParams) =>
  useQuery({
    queryKey: ["organisation_ror_search", name],
    queryFn: async () => {
      const response = await APIClient(
        token,
      ).get<OrganisationRORSearchResponse>(
        `/integrations/organisations/ROR/${name}?page=${page}`,
      );
      return response.data;
    },
    onError: (error: AxiosError) => {
      return handleBackendError(error);
    },
    enabled: name.length > 2,
    staleTime: 10 * 1000,
  });
