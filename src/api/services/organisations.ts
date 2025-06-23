import { AxiosError } from "axios";
import {
  OrganisationSearchParams,
  OrganisationRORSearchResponse,
} from "@/types";
import { APIClient } from "@/api";
import { useQuery } from "@tanstack/react-query";
import { handleBackendError } from "@/utils";

export const useOrganisationSearch = ({
  name,
  source,
  page,
  token,
}: OrganisationSearchParams) =>
  useQuery({
    queryKey: ["organisation_search", name],
    queryFn: async () => {
      const response = await APIClient(
        token,
      ).get<OrganisationRORSearchResponse>(
        `/v1/integrations/organisations/${source}/${name}?page=${page}`,
      );

      return response.data as OrganisationRORSearchResponse;
    },
    onError: (error: AxiosError) => {
      return handleBackendError(error);
    },
    enabled: name.length > 2,
    staleTime: 10 * 1000,
  });
