import { ApiServiceErr, OrganisationRORSearchParams, OrganisationRORSearchResponse } from "../../types/common";
import Client from "../client";
import { useQuery } from "@tanstack/react-query";

const Organisation = {
  useOrganisationRORSearch: ({ name, page, token }: OrganisationRORSearchParams) =>
    useQuery<OrganisationRORSearchResponse, any>({
      queryKey: ["organisation_ror_search", name],
      queryFn: async () => {
        const response = await Client(token).get<OrganisationRORSearchResponse>(
          `/integrations/organisations/ROR/${name}?page=${page}`
        );
        return response.data;
      },
      onError: (error: any) => {
        return error.response as ApiServiceErr;
      },
      enabled: name.length > 2,
      staleTime: 10 * 1000
    })
};

export default Organisation;
