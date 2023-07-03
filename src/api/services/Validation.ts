import Client from "../client";
import { useQuery } from "@tanstack/react-query";

const Validation = {
  useValidationRequest: ({
    organisation_role,
    organisation_id,
    organisation_source,
    organisation_name,
    organisation_website,
    actor_id,
    token
  }: ValidationRequestParams) =>
    useQuery<ValidationRequestResponse, any>({
      queryKey: [
        "validations",
        {
          organisation_role,
          organisation_id,
          organisation_source,
          organisation_name,
          organisation_website,
          actor_id
        }
      ],
      queryFn: async () => {
        const response = await Client(token).post<ValidationRequestResponse>(`/validations`, {
          organisation_role,
          organisation_id,
          organisation_source,
          organisation_name,
          organisation_website,
          actor_id,
          token
        });
        return response.data;
      },
      onError: (error) => {
        console.log(error);
        return error.response as ApiServiceErr;
      },
      enabled: false
    })
};

export default Validation;
