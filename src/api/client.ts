import axios from "axios";

const Client = (token: string) => {
  const client = axios.create({
    baseURL: "http://localhost:8080/v1/",
    headers: {'Authorization': `Bearer ${token}`}
  });

  client.defaults.headers.common['Content-Type'] = 'application/json';
  return client;
}

export default Client;