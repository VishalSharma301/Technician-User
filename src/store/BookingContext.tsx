// src/store/BookingContext.tsx

import React, {
  createContext,
  PropsWithChildren,
  useState,
  useContext,
} from "react";
import { Alert } from "react-native";
import {
  bookCartItems,
  BookingRequest,
  BookingResponse,
  formatBookingDate,
} from "../utils/bookingApi";
import { ProfileContext } from "./ProfileContext";
import { AddressContext } from "./AddressContext";
import { CartContext } from "./CartContext";

interface BookingContextProps {
  isBooking: boolean;
  lastBookingResult: BookingResponse | null;
  bookCurrentCart: (
    scheduledDate: Date,
    timeSlot: string,
    notes?: string,
    paymentMethod?: string
  ) => Promise<BookingResponse | null>;
  clearBookingResult: () => void;
}

export const BookingContext = createContext<BookingContextProps>({
  isBooking: false,
  lastBookingResult: null,
  bookCurrentCart: async () => null,
  clearBookingResult: () => {},
});

export default function BookingContextProvider({
  children,
}: PropsWithChildren) {
  const [isBooking, setIsBooking] = useState(false);
  const [lastBookingResult, setLastBookingResult] =
    useState<BookingResponse | null>(null);

  const { userId } = useContext(ProfileContext);
  const { selectedAddress } = useContext(AddressContext);
  const { fetchCart, isCartEmpty, cartItems } = useContext(CartContext);

  const bookCurrentCart = async (
    scheduledDate: Date,
    timeSlot: string,
    notes?: string,
    paymentMethod: string = "cash"
  ): Promise<BookingResponse | null> => {
    // ✅ ADD DEBUGGING
    console.log("=== BOOKING DEBUG INFO ===");
    console.log("userId:", userId);
    console.log("selectedAddress:", selectedAddress);
    console.log("isCartEmpty:", isCartEmpty);
    console.log("cartItems from CartContext:", cartItems); 

    // Validation
    if (!userId) {
      Alert.alert("Error", "Please log in to book services");
      return null;
    }

    if (!selectedAddress) {
      Alert.alert("Error", "Please select a delivery address");
      return null;
    }

    if (isCartEmpty) {
      Alert.alert("Error", "Your cart is empty");
      return null;
    }

    try {
      setIsBooking(true);

      const bookingRequest: BookingRequest = {
        userId,
        address: {
          street: selectedAddress.address.street || "123 Street",
          city: selectedAddress.address.city || "Morinda",
          state: selectedAddress.address.state || "Punjab",
          zipcode: selectedAddress.address.zipcode || "140802",
          coordinates: {
            lat: selectedAddress.address.coordinates.lat || 212.00,
            lon: selectedAddress.address.coordinates.lon || 212.00,
          },
        },
        scheduledDate: formatBookingDate(scheduledDate),
        scheduledTimeSlot: timeSlot,
        paymentMethod,
        notes,
      };

      const result = await bookCartItems(bookingRequest);
      setLastBookingResult(result);

      if (result.success && result.summary.successfulBookings > 0) {
        // Refresh cart to clear booked items
        await fetchCart();

        Alert.alert(
          "Booking Successful! 🎉",
          `${result.summary.successfulBookings} service(s) booked successfully.\nTotal Amount: ₹${result.summary.totalAmount}`,
          [{ text: "View Details", style: "default" }]
        );
      }

      return result;
    } catch (error: any) {
      console.error("Booking error:", error);
      Alert.alert("Booking Failed", error.message || "Please try again");
      return null;
    } finally {
      setIsBooking(false);
    }
  };

  const clearBookingResult = () => {
    setLastBookingResult(null);
  };

  const value = {
    isBooking,
    lastBookingResult,
    bookCurrentCart,
    clearBookingResult,
  };

  return (
    <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
  );
}
