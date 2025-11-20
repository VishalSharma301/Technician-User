import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ServiceRequestsResponse,
  ServiceRequestQueryParams,
} from "../constants/serviceRequestTypes";
import { BASE } from "./BASE_URL";

const API_BASE_URL = BASE;

// Helper function to build query string from params
const buildQueryString = (params: ServiceRequestQueryParams): string => {
  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, String(value));
    }
  });

  return queryParams.toString();
};

// Get authorization token
const getAuthToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem("token");
  } catch (error) {
    console.error("Error getting auth token:", error);
    return null;
  }
};

// Main API function to get service requests
export const getServiceRequests = async (
  params: ServiceRequestQueryParams = {}
): Promise<ServiceRequestsResponse> => {
  try {
    const token = await getAuthToken();

    if (!token) {
      throw new Error("No authentication token found");
    }

    const queryString = buildQueryString(params);
    const url = `${API_BASE_URL}/api/users/service-requests${
      queryString ? `?${queryString}` : ""
    }`;

    const response = await axios.get<ServiceRequestsResponse>(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Service Requests API Error:",
        error.response?.data || error.message
      );
      throw new Error(
        error.response?.data?.message || "Failed to fetch service requests"
      );
    }
    throw error;
  }
};

// Specific helper functions for common queries

export const getUpcomingServiceRequests = async (
  page: number = 1,
  limit: number = 10
): Promise<ServiceRequestsResponse> => {
  return getServiceRequests({ upcoming: true, page, limit });
};

export const getPastServiceRequests = async (
  page: number = 1,
  limit: number = 10
): Promise<ServiceRequestsResponse> => {
  return getServiceRequests({ past: true, page, limit });
};

export const getActiveServiceRequests = async (
  page: number = 1,
  limit: number = 10
): Promise<ServiceRequestsResponse> => {
  return getServiceRequests({ active: true, page, limit });
};

export const getCompletedServiceRequests = async (
  page: number = 1,
  limit: number = 10
): Promise<ServiceRequestsResponse> => {
  return getServiceRequests({ status: "completed", page, limit });
};

export const getPendingPaymentServiceRequests = async (
  page: number = 1,
  limit: number = 10
): Promise<ServiceRequestsResponse> => {
  return getServiceRequests({ paymentStatus: "pending", page, limit });
};

export const searchServiceRequests = async (
  searchTerm: string,
  page: number = 1,
  limit: number = 10
): Promise<ServiceRequestsResponse> => {
  return getServiceRequests({ search: searchTerm, page, limit });
};

export const getServiceRequestsByStatus = async (
  status: ServiceRequestQueryParams["status"],
  page: number = 1,
  limit: number = 10
): Promise<ServiceRequestsResponse> => {
  return getServiceRequests({ status, page, limit });
};

export const getServiceRequestsByPriceRange = async (
  minPrice: number,
  maxPrice: number,
  page: number = 1,
  limit: number = 10
): Promise<ServiceRequestsResponse> => {
  return getServiceRequests({ minPrice, maxPrice, page, limit });
};

export const getServiceRequestsByDateRange = async (
  startDate: string,
  endDate: string,
  page: number = 1,
  limit: number = 10
): Promise<ServiceRequestsResponse> => {
  return getServiceRequests({ startDate, endDate, page, limit });
};
