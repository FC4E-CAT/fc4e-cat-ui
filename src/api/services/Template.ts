import { AxiosError } from "axios";
import { TemplateResponse } from "../../types";
import Client from "../client";
import { useQuery } from "@tanstack/react-query";
import { handleBackendError } from "../../utils/Utils";

/** Backend calls for getting Assessment Template */
const Template = {
  useGetTemplate: (templateTypeId: number, actorId: number|undefined, token: string, isRegistered: boolean ) =>
    useQuery({
      queryKey: ["template",actorId],
      queryFn: async () => {
        const response = await Client(token).get<TemplateResponse>(
          `/templates/by-type/${templateTypeId}/by-actor/${actorId}`
        );
        return response.data;
      },
      onError: (error: AxiosError) => {
        return handleBackendError(error);
      },
      enabled: !!token && isRegistered && actorId !== undefined
    })
};

export default Template;
