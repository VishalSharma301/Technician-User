// src/api/axiosClient.ts
import axios from "axios";
import { BASE } from "./BASE_URL";

const URL = `${BASE}/api`;

export const axiosClient = axios.create({
  baseURL: URL, // 🔁 replace with env/base url
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Optional: auth interceptor
axiosClient.interceptors.request.use(
  async (config) => {
    // const token = await getAuthToken();
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// src/api/types/conversationBooking.ts

export type QuantityType = "single" | "double" | "triple" | string;
export type PreferredTime = "morning" | "afternoon" | "evening";

// types/CreateConversationBookingPayload.ts

export interface SelectedOptionPayload {
  optionId: string;
  name: string;
  price: number;
}

export interface SelectedSubServicePayload {
  subServiceId: string;
  name: string;
  price: number;
}

export interface SelectedBrandPayload {
  brandId: string;
  name: string;
}

export interface CreateConversationBookingPayload {
  userId: string;
  zipcode: string;

  selectedOption: SelectedOptionPayload;
  selectedSubServices?: SelectedSubServicePayload[];

  selectedBrand?: SelectedBrandPayload;

  quantity: number;

  address: {
    street: string;
    city: string;
    state?: string;
    zipcode?: string;
  };

  notes?: string;
  preferredDate?: string;
  preferredTime?: string;
  paymentMethod?: "cash" | "online";
}

/* ---------- Success Response ---------- */

/* ---------------- ADDRESS ---------------- */

export interface BookingAddress {
  street: string;
  city: string;
  state: string;
  zipcode: string;
}

/* ---------------- PROVIDER ---------------- */

export interface BookingProvider {
  _id: string;
  id: string;
  name: string;
  companyName: string;
  email: string;
  phoneNumber: string;
  rating: number;
  fullAddress: string;
}

/* ---------------- BRAND ---------------- */

export interface SelectedBrand {
  brandId: {
    _id: string;
    name: string;
    logo: string;
  };
  name: string;
}

/* ---------------- OPTION ---------------- */

export interface SelectedOption {
  optionId: string;
  name: string;
  price: number;
}

/* ---------------- SERVICE ---------------- */

export interface BookedService {
  _id: string;
  name: string;
  description: string;
  icon: string;
  estimatedTime: string;
  category: {
    _id: string;
    name: string;
    icon: string;
  };
}

/* ---------------- MAIN RESPONSE ---------------- */

export interface ConversationBookingResponse {
  data: {
    _id: string;
    user: string;

    address: BookingAddress;
    zipcode: string;

    selectedOption: SelectedOption;
    selectedBrand: SelectedBrand | null;
    selectedSubServices: any[];

    quantity: number;

    optionPrice: number;
    subServicesPrice: number;
    basePrice: number;
    finalPrice: number;

    notes: string;

    status: "booked" | "cancelled" | "completed";

    paymentMethod: "cash" | "online";
    paymentStatus: "pending" | "paid" | "failed";

    completionPin: string;
    pinVerified: boolean;

    provider: BookingProvider | null;
    service: BookedService;

    bookedAt: string;
    requestSubmittedAt: string;
    createdAt: string;
    updatedAt: string;

    __v: number;
  };
}

export async function createConversationBooking(
  serviceId: string,
  payload: CreateConversationBookingPayload
): Promise<ConversationBookingResponse> {
  try {
    const response = await axiosClient.post<ConversationBookingResponse>(
      `/test/services/${serviceId}/book-service/single`,
      payload
    );

    return response.data;
  } catch (error: any) {
    if (error.response) {
      // Backend validation / known errors
      throw new Error(error.response.data?.message || "Booking failed");
    }

    throw new Error("Network error while creating booking");
  }
}
