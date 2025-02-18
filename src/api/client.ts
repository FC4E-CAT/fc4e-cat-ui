import axios from "axios";
import { API } from "@/config";

export const APIClient = (token?: string) => {
  // if token is provided create a client with auth header
  const client = token
    ? axios.create({
        baseURL: `${API.base_url}`,
        headers: { Authorization: `Bearer ${token}` },
      })
    : axios.create({
        baseURL: `${API.base_url}`,
      });

  client.defaults.headers.common["Content-Type"] = "application/json";
  return client;
};
