import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import { BASE_URL } from "../api/BaseUrl";

interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  //   timeout: 20000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

const getAccessToken = (): string | null => {
  return localStorage.getItem("authToken");
};

const getRefreshToken = (): string | null => {
  return localStorage.getItem("refreshToken");
};

const setAccessToken = (token: string): void => {
  localStorage.setItem("authToken", token);
};

const clearTokens = (): void => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("refreshToken");
};

const refreshAccessToken = async (): Promise<string | null> => {
  try {
    const refreshToken = await getRefreshToken();

    if (!refreshToken) {
      console.log("first");
      throw new Error("Refresh token not found");
    }

    const response = await axios.put(
      `https://ec2api.deltatech-backend.com/api/v1/auth/refresh`,
      {
        refresh_token: refreshToken,
      }
    );

    const newAccessToken = response.data[0];
    setAccessToken(newAccessToken);
    const newRefreshToken = response.data[1];
    if (newRefreshToken) {
      localStorage.setItem("refreshToken", newAccessToken);
    }
    return newAccessToken;
  } catch (error) {
    clearTokens();
    console.error("Failed to refresh access token", error);
    window.location.href = "/";
    return null;
  }
};

// Interceptor để thêm Access Token vào header của mỗi request
axiosInstance.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Interceptor để xử lý khi Access Token hết hạn
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;
    if (
      error.response?.status === 403 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      const newAccessToken = await refreshAccessToken();
      if (newAccessToken && originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
