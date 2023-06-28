import axios from "axios";
import { API } from "../config";

const Client = (token: string) => {
  const client = axios.create({
    baseURL: `${API.base_url}/${API.version}/`,
    headers: {'Authorization': `Bearer ${token}`}
  });

  client.defaults.headers.common['Content-Type'] = 'application/json';
  return client;
}

export default Client;