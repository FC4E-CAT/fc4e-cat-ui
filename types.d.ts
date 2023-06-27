interface UserProfile {
  id: string;
  registered_on: string;
  user_type: string;
}

type ApiServiceErr = any;

interface ApiAuthOptions {
  token: string;
}

interface ApiAuthOptions {
  limit: number;
  page: number;
  sortBy: string;
}

type ApiOptions = ApiAuthOptions | ApiAuthOptions;