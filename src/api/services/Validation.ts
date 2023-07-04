import Client from "../client";
import { useQuery } from "@tanstack/react-query";

const Validation = {
  useValidations: ({ size, page, sortBy, token, isRegistered }: ApiOptions) =>
    useQuery<APIValidationResponse, any>({
      queryKey: ["validations", { size, page, sortBy }],
      queryFn: async () => {
        const response = await Client(token).get<APIValidationResponse>(
          `/validations?size=${size}&page=${page}&sortby=${sortBy}`
        );
        return response.data;
      },
      onError: (error) => {
        console.log(error.response);
        return error.response as ApiServiceErr;
      },
      enabled: !!token && isRegistered,
    }),
  useAdminValidations: ({ size, page, sortBy, token, isRegistered }: ApiOptions) =>
    useQuery<APIValidationResponse, any>({
      queryKey: ["admin_validations", { size, page, sortBy }],
      queryFn: async () => {
        const response = await Client(token).get<APIValidationResponse>(
          `/admin/validations?size=${size}&page=${page}&sortby=${sortBy}`
        );
        return response.data;
      },
      onError: (error) => {
        console.log(error.response);
        return error.response as ApiServiceErr;
      },
      enabled: !!token && isRegistered,
    }),
  useValidationRequest: ({
    organisation_role,
    organisation_id,
    organisation_source,
    organisation_name,
    organisation_website,
    actor_id,
    token
  }: ValidationRequestParams) =>
    useQuery<ValidationResponse, any>({
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
        const response = await Client(token).post<ValidationResponse>(`/validations`, {
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
