import Client from "../client";
import { useQuery } from "@tanstack/react-query";

const Actor = {
  useGetActors: ({ size, page, sortBy, token, isRegistered }: ApiOptions) =>
    useQuery<ActorListResponse, any>({
      queryKey: ["actors", { size, page, sortBy }],
      queryFn: async () => {
        const response = await Client(token).get<ActorListResponse>(
          `/codelist/actors?size=${size}&page=${page}&sortby=${sortBy}`
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

export default Actor;
