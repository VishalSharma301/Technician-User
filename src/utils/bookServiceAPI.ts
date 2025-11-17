import axios, {AxiosError} from "axios";
import { BASE } from "./BASE_URL";
import { Address } from "../constants/types";



const URL = `${BASE}/api`;

 type BookingPayload= {
  serviceId: string;
  address: Address;
  zipcode: string;
  scheduledDate?: string; // ISO 8601 format e.g. "2025-07-25T14:00:00Z"
  notes?: string;        // optional, in case notes aren’t always provided
}



type ApiErrorResponse = {
  message?: string;
  errors?: Record<string, string[]>;
};


export async function bookServiceAPI(token: string, serviceId: string, address: Address, notes?: string, scheduledDate?: string ) {
  const url = `${URL}/users/book-service`;

  const payload : BookingPayload = {
    serviceId: serviceId,
    address: {
      street: address.street,
      city: address.city,
      state: address.state,
      zipcode: address.zipcode,
      coordinates: address.coordinates,
    },
    zipcode: address.zipcode,
    scheduledDate: scheduledDate, // ✅ exactly this format
    notes: notes || "",
  };

   console.log("📡 Sending POST request to:", url);
  console.log("🔐 Authorization Token:", token);
  console.log("📦 Request Headers:", {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  });
  console.log("📝 Request Payload:", payload);


  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`, // ✅ token header
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload), // ✅ exact body structure
    });

    const text = await response.text();

    if (!response.ok) {
      let errorMessage = "Failed to book service";
      try {
        const errorData = text ? JSON.parse(text) : null;
        if (errorData?.message) errorMessage = errorData.message;
      } catch {
        // Fallback if not JSON
      }
      throw new Error(errorMessage);
    }

    const result = text ? JSON.parse(text) : {};
    console.log("✅ Service booked successfully:", result);
    return result;
  } catch (error) {
    console.error("❌ API error:", error);
    throw error;
  }
}



export const fetchMyBookedServices = async (token: string) => {
  try {
    const response = await axios.get(`${URL}/users/my-booked-services?limit=50`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("✅ My Booked Services:", response.data);
    return { success: true, data: response.data };
  } catch (err) {
    const axiosError = err as AxiosError<ApiErrorResponse>;
    const status = axiosError.response?.status;
    const data = axiosError.response?.data;

    console.error(
      "❌ Error fetching booked services:",
      data?.message || axiosError.message || "Unknown error"
    );

    return { success: false, error: data?.message || axiosError.message };
  }
};

export const fetchMyHistory = async (token: string) => {
  try {
    const response = await axios.get(`${URL}/users/my-history`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("✅ My History:", response.data);
    return { success: true, data: response.data };
  } catch (err) {
    const axiosError = err as AxiosError<ApiErrorResponse>;
    const status = axiosError.response?.status;
    const data = axiosError.response?.data;

    console.error(
      "❌ Error fetching history:",
      data?.message || axiosError.message || "Unknown error"
    );

    return { success: false, error: data?.message || axiosError.message };
  }
};