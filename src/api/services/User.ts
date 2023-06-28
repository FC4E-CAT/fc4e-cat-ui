import Client from "../client";
import { useQuery } from "@tanstack/react-query";

const User = {
  useGetProfile: ({token }: ApiOptions) =>
    useQuery<UserResponse, any>(
      [token],
      async () => {
        const response = await Client(token).get<UserResponse>(
          `/users/profile`
        );
        return response.data;
      },
      {
        onError: (error) => {
          console.log(error);
          return (error.response as ApiServiceErr)
        }
      }
    ),
  useGetUsers: ({ limit, page, sortBy, token }: ApiOptions) =>
    useQuery<UserListResponse, any>(
      [limit, page, sortBy, token],
      async () => {
        const response = await Client(token).get<UserListResponse>(
          `/users?limit=${limit}&page=${page}&sortby=${sortBy}`
        );
        return response.data;
      },
      {
        onError: (error) => {
          console.log(error.response);
          return (error.response as ApiServiceErr)
        }
      }
    )
};

export default User;
