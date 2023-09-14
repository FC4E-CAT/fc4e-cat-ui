
import { AxiosError } from "axios";
import { ActorListResponse, ApiOptions } from "../../types/common";
import Client from "../client";
import { useQuery } from "@tanstack/react-query";
import { handleBackendError } from "../../utils/Utils";

const Actor = {
  useGetActors: ({ size, page, sortBy, token, isRegistered }: ApiOptions) =>
    useQuery({
      queryKey: ["actors", { size, page, sortBy }],
      queryFn: async () => {
        const response = await Client(token).get<ActorListResponse>(
          `/codelist/actors?size=${size}&page=${page}&sortby=${sortBy}`
        );
        return response.data;
      },
      onError: (error: AxiosError) => {
        return handleBackendError(error);
      },
      enabled: !!token && isRegistered
    })
};

export default Actor;
