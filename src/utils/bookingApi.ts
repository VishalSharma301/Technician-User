// src/util/bookingApi.ts

import axios from "axios";
import { BASE } from "./BASE_URL";
import { Address } from "../constants/types";

export interface BookingRequest {
  userId: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipcode: string;
    coordinates: {
      lat: number;
      lon: number;
    };
  };
  scheduledDate: string; // ISO string
  scheduledTimeSlot: string;
  paymentMethod?: string;
  notes?: string;
  specialInstructions?: string;
}

export interface BookingItem {
  _id: string;
  service: string;
  provider: string;
  scheduledDate: string;
  status: string;
  amount: number;
}

export interface AssignmentDetail {
  provider: string;
  score: number;
  distance: string;
}

export interface BookingSummary {
  totalBookings: number;
  successfulBookings: number;
  failedBookings: number;
  totalAmount: number;
}

export interface BookingResponse {
  success: boolean;
  bookings: BookingItem[];
  assignmentDetails: AssignmentDetail[];
  summary: BookingSummary;
  failedItems: any[];
  message?: string;
}

/**
 * Book all items in cart
 * POST /api/booking/book
 */
export const bookCartItems = async (bookingData: BookingRequest) => {
  try {
    console.log("📅 Booking cart items:", bookingData);

    const response = await axios.post(
      `${BASE}/api/users/services/book`,
      bookingData,
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 30000, // 30 second timeout for booking
      }
    );

    console.log("✅ Booking successful:", response.data);
    const { data } = response.data;
    return {
      success: response.data.success,
      message: response.data.message,
      ...data,
    };
  } catch (error: any) {
    console.error("❌ Booking failed:", error);

    if (error.response) {
      // Server responded with error
      throw new Error(
        error.response.data?.message ||
          `Booking failed with status ${error.response.status}`
      );
    } else if (error.request) {
      // Network error
      throw new Error("Network error - please check your connection");
    } else {
      // Other error
      throw new Error(error.message || "Booking failed");
    }
  }
};

// Helper function to format date for booking
export const formatBookingDate = (date: Date): string => {
  return date.toISOString();
};

// Helper function to generate time slots
export const getAvailableTimeSlots = (): string[] => {
  return [
    "09:00 AM - 11:00 AM",
    "10:00 AM - 12:00 PM",
    "11:00 AM - 01:00 PM",
    "02:00 PM - 04:00 PM",
    "03:00 PM - 05:00 PM",
    "04:00 PM - 06:00 PM",
    "05:00 PM - 07:00 PM",
  ];
};
