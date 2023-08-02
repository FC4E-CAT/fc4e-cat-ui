import { ApiServiceErr, TemplateResponse } from "../../types";
import Client from "../client";
import { useQuery } from "@tanstack/react-query";

/** Backend calls for getting Assessment Template */
const Template = {
  useGetTemplate: (templateTypeId: number, actorId: number, token: string, isRegistered: boolean ) =>
    useQuery<TemplateResponse, any>({
      queryKey: ["template"],
      queryFn: async () => {
        const response = await Client(token).get<TemplateResponse>(
          `/templates/by-type/${templateTypeId}/by-actor/${actorId}`
        );
        return response.data;
      },
      onError: (error) => {
        console.log(error.response);
        return error.response as ApiServiceErr;
      },
      enabled: !!token && isRegistered
    })
};

export default Template;
