import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

const api = axios.create({
  baseURL: "https://ec2api.deltatech-backend.com/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  async (config: AxiosRequestConfig): Promise<AxiosRequestConfig> => {
    const token = localStorage.getItem("accessToken");
    if (token && config.headers) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("refreshToken");
      const newTokens = await getNewTokens(refreshToken);
      if (newTokens) {
        localStorage.setItem("accessToken", newTokens.accessToken);
        localStorage.setItem("refreshToken", newTokens.refreshToken);
        api.defaults.headers.common["Authorization"] =
          "Bearer " + newTokens.accessToken;
        originalRequest.headers["Authorization"] =
          "Bearer " + newTokens.accessToken;
        return api(originalRequest);
      }
    }
    return Promise.reject(error);
  }
);

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

const getNewTokens = async (
  refreshToken: string | null
): Promise<TokenResponse | null> => {
  try {
    const response = await axios.post<TokenResponse>(
      "https://ec2api.deltatech-backend.com/api/v1/auth/refresh",
      { token: refreshToken }
    );
    return response.data;
  } catch (error) {
    console.error("Refresh token failed", error);
    return null;
  }
};

export default api;
