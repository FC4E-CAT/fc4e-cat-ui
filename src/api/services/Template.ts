import { ApiServiceErr, TemplateResponse } from "../../types";
import Client from "../client";
import { useQuery } from "@tanstack/react-query";

/** Backend calls for getting Assessment Template */
const Template = {
  useGetTemplate: (templateTypeId: number, actorId: number|undefined, token: string, isRegistered: boolean ) =>
    useQuery<TemplateResponse, any>({
      queryKey: ["template",actorId],
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
      enabled: !!token && isRegistered && actorId !== undefined
    })
};

export default Template;
