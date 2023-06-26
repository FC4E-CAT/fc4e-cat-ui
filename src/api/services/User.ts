import Client from "../client";

const User = {
  getProfile: (token: string) => {
    try {
      return Client(token).get<UserProfile>("users/profile");
    } catch (error) {
      return Promise.reject(error);
    }
  }
};

export default User;
