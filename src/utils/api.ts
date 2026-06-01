// services/api.ts
// Axios instance with:
//   - Base URL from env (or hardcoded fallback)
//   - Auto-attaches Bearer token from AsyncStorage on every request
//   - Handles 401 (token expired) by clearing storage and redirecting to login
//   - Normalises error messages so hooks can read err.response.data.message

import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE } from "./BASE_URL";

// ─── Config ───────────────────────────────────────────────────────────────────
// Set your base URL here. Use an .env file with expo-constants or a plain const.

// const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "https://your-api.com/api";
const TOKEN_KEY = "token"; // the AsyncStorage key you use when saving the token

// ─── Instance ─────────────────────────────────────────────────────────────────

const api = axios.create({
  baseURL: BASE,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ─── Request Interceptor — attach token ───────────────────────────────────────

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // If AsyncStorage read fails, proceed without token
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor — normalise errors ──────────────────────────────────

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear storage
      // You can emit an event or use a navigation ref here to redirect to login
      await AsyncStorage.removeItem(TOKEN_KEY);
      // Optional: navigationRef.current?.navigate("Login");
      console.warn("[api] 401 — token cleared. Redirect to login.");
    }
    return Promise.reject(error);
  }
);

// ─── Auth helpers (call these from your login / logout screens) ───────────────

/** Save token after login */
export async function saveToken(token: string) {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

/** Remove token on logout */
export async function clearToken() {
  await AsyncStorage.removeItem(TOKEN_KEY);
}

/** Read token if needed directly */
export async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export default api;