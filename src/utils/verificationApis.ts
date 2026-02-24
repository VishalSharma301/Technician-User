import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE } from "./BASE_URL";
// 👉 If this is NOT React Native, replace AsyncStorage with localStorage

const apiClient = axios.create({
  baseURL: BASE, // 🔴 change this
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Attach token to every request
 */
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Global response error handling (optional but recommended)
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(
      "API Error:",
      error?.response?.data || error.message
    );
    return Promise.reject(error);
  }
);

export default apiClient;



export const getPendingVerifications = async () => {
  const { data } = await apiClient.get(
    "/api/users/verifications/pending"
  );
  return data;
};




export const getJobVerificationDetails = async (jobId: string) => {
  const { data } = await apiClient.get(
    `/api/users/jobs/${jobId}/verification`
  );
  return data;
};

/**
 * TEST 14
 * User approves inspection details
 */
export const verifyJobDetails = async (jobId: string) => {
  const { data } = await apiClient.post(
    `/api/users/jobs/${jobId}/verify`
  );
  return data;
};
export const dismissVerification = async (jobId: string) => {
  const { data } = await apiClient.post(
    `/api/users/jobs/${jobId}/reject`
  );
  return data;
};