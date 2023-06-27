import Client from "../client";
import { useQuery } from "@tanstack/react-query";

type UserResponse = UserProfile;

const User = {
  useGetProfile: ({ limit, page, sortBy, token }: ApiOptions) =>
    useQuery<UserResponse, ApiServiceErr>(
      [limit, page, sortBy, token],
      async () => {
        const response = await Client(token).get<UserResponse>(
          `/users/profile?limit=${limit}&page=${page}&sortby=${sortBy}`
        );
        return response.data;
      },
      {
        onError: (error) => {
          console.error("Error fetching uer profile:", error);
        }
      }
    )
};

export default User;
