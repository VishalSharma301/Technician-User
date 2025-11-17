import axios, { AxiosError } from "axios";
import { BASE } from "./BASE_URL";
import { CartItemType } from "../constants/cartType";
import { AddToCartPayload } from "../constants/types";

// Types for Cart API

export interface UpdateCartItemPayload {
  quantity: number;
}

export interface CartResponse {
  success: boolean;
  data: {
    id: string;
    user: string;
    zipcode: string;
    items: CartItemType[];
    totalItems: number;
    totalPrice: number;
  };
  message?: string;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
}

// Cart API Functions

/**
 * Add item to cart
 * POST /api/users/cart
 */
export const addToCart = async (
  payload: AddToCartPayload
): Promise<CartResponse> => {
  try {
    const response = await axios.post(`${BASE}/api/users/cart/add`, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error adding to cart:", error);

    if (axios.isAxiosError(error)) {
      console.log("AXIOS ERROR DATA:", error.response?.data);
    } else {
      console.log("Unknown error:", error);
    }

    throw error;
  }
};

/**
 * Get user's cart
 * GET /api/users/cart/{userId}
 */
export const getCart = async (userId: string): Promise<CartResponse> => {
  try {
    const response = await axios.get(`${BASE}/api/users/cart/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching cart:", error);
    throw error;
  }
};

/**
 * Update cart item quantity
 * PATCH /api/users/cart/{userId}/item/{itemId}
 */
export const updateCartItemQuantity = async (
  userId: string,
  itemId: string,
  payload: UpdateCartItemPayload
): Promise<CartResponse> => {
  try {
    const response = await axios.patch(
      `${BASE}/api/users/cart/${userId}/item/${itemId}`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating cart item quantity:", error);
    throw error;
  }
};

/**
 * Remove item from cart
 * DELETE /api/users/cart/{userId}/item/{itemId}
 */
export const removeCartItem = async (
  userId: string,
  itemId: string
): Promise<ApiResponse> => {
  try {
    const response = await axios.delete(
      `${BASE}/api/users/cart/${userId}/item/${itemId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error removing cart item:", error);
    throw error;
  }
};

/**
 * Clear entire cart
 * DELETE /api/users/cart/{userId}/clear
 */
export const clearCart = async (userId: string): Promise<ApiResponse> => {
  try {
    const response = await axios.delete(
      `${BASE}/api/users/cart/${userId}/clear`
    );
    return response.data;
  } catch (error) {
    console.error("Error clearing cart:", error);
    throw error;
  }
};

// Helper function to handle API errors
export const handleCartApiError = (error: any): string => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    const { status, data } = error.response;

    switch (status) {
      case 400:
        return data.message || "Invalid request parameters";
      case 404:
        return data.message || "Cart or item not found";
      case 500:
        return data.message || "Internal server error";
      default:
        return data.message || "An error occurred";
    }
  } else if (error.request) {
    // The request was made but no response was received
    return "Network error - please check your connection";
  } else {
    // Something happened in setting up the request that triggered an Error
    return "Request setup error";
  }
};

// Usage Examples:

/**
 * Example: Add item to cart
 *
 * const addItemToCart = async () => {
 *   try {
 *     const payload: AddToCartPayload = {
 *       userId: "66f8ac7b15cd72a1a4e51a6a",
 *       serviceId: "66f8b2e271f472c8823c8e94",
 *       zipcode: "140802",
 *       selectedOption: {
 *         optionId: "66f8b31e7e2c8d25ac932f10",
 *         name: "Top Load",
 *         price: 1500
 *       },
 *       selectedSubServices: [{
 *         subServiceId: "66f8b33171e52c25ac932f52",
 *         name: "Drum Cleaning",
 *         price: 500
 *       }],
 *       selectedBrand: {
 *         brandId: "66f8b2a47e2c8d25ac932e90",
 *         name: "Samsung"
 *       },
 *       quantity: 1
 *     };
 *
 *     const result = await addToCart(payload);
 *     console.log('Cart updated:', result);
 *   } catch (error) {
 *     console.error('Failed to add to cart:', handleCartApiError(error));
 *   }
 * };
 */

/**
 * Example: Update cart item quantity
 *
 * const updateQuantity = async () => {
 *   try {
 *     const result = await updateCartItemQuantity(
 *       "66f8ac7b15cd72a1a4e51a6a", // userId
 *       "66f8c1337e2c8d25ac932fa3", // itemId
 *       { quantity: 2 }
 *     );
 *     console.log('Quantity updated:', result);
 *   } catch (error) {
 *     console.error('Failed to update quantity:', handleCartApiError(error));
 *   }
 * };
 */
