// src/store/CartContext.tsx

import React, {
  createContext,
  PropsWithChildren,
  useState,
  useContext,
} from "react";
import { Alert } from "react-native";
import {
  addToCart as addToCartAPI,
  getCart as getCartAPI,
  removeCartItem as removeCartItemAPI,
  clearCart as clearCartAPI,
  updateCartItemQuantity as updateCartItemQuantityAPI,
  handleCartApiError,
} from "../utils/cartApis";
import {
  CartItemLocal,
  ServiceData,
  AddToCartPayload,
  ServiceOption,
  ServiceBrand,
} from "../constants/types";
import { ProfileContext } from "./ProfileContext";
import { AddressContext } from "./AddressContext";
import { CartItemType } from "../constants/cartType";

interface CartContextProps {
  cartItems: CartItemLocal[];
  totalPrice: number;
  totalItems: number;
  isLoading: boolean;
  addToCart: (
    service: ServiceData,
    option: ServiceOption,
    brand?: ServiceBrand,
    quantity?: number
  ) => Promise<void>;
  isItemInTheCart: (serviceName: string) => boolean;
  removeFromCart: (itemId: string) => Promise<void>;
  emptyCart: () => void;
  updateItemQuantity: (itemId: string, quantity: number) => Promise<void>;
  fetchCart: () => Promise<void>;
  isCartEmpty: boolean;
}

export const CartContext = createContext<CartContextProps>({
  cartItems: [],
  totalPrice: 0,
  totalItems: 0,
  isLoading: false,
  addToCart: async () => {},
  isItemInTheCart: () => false,
  removeFromCart: async () => {},
  emptyCart: () => {},
  updateItemQuantity: async () => {},
  fetchCart: async () => {},
  isCartEmpty: false,
});

export default function CartContextProvider({ children }: PropsWithChildren) {
  // ✅ SINGLE SOURCE OF TRUTH
  const [cartItems, setCartItems] = useState<CartItemLocal[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // ✅ DERIVED VALUES
  const totalPrice = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const isCartEmpty = cartItems.length < 1;

  // ✅ GET USER CONTEXT
  const { userId } = useContext(ProfileContext);
  const { selectedAddress } = useContext(AddressContext);

  // ✅ SIMPLIFIED FETCH CART
  async function fetchCart() {
    if (!userId) {
      console.warn("No userId available for cart fetch");
      return;
    }

    try {
      setIsLoading(true);
      const response = await getCartAPI(userId);
      console.log("cart data : ", response);
      

      if (response.success && response.data) {
        // ✅ Map API response to local format using ACTUAL structure
        const mappedItems: CartItemLocal[] = response.data.items.map(
          (apiItem: CartItemType) => ({
            _id: apiItem._id, // ✅ Map to _id if interface uses _id
            id: apiItem._id, // ✅ Also provide id
            serviceId: apiItem.service._id,
            serviceName: apiItem.service.name,
            quantity: apiItem.quantity,
            basePrice: apiItem.priceDescription.items[0].basePrice,
            totalPrice: apiItem.priceDescription.total ?? 0,
            selectedBrand:
              apiItem.selectedOption?.name ||
              apiItem.selectedBrand?.name ||
              undefined,
          })
        );
        setCartItems(mappedItems);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      Alert.alert("Error", handleCartApiError(error));
    } finally {
      setIsLoading(false);
    }
  }

  // ✅ SIMPLIFIED ADD TO CART
async function addToCart(
  service: ServiceData,
  option: ServiceOption,
  brand?: ServiceBrand,
  quantity: number = 1
) {
  console.log("--- addToCart called (CartContext) ---");
  console.log("service param:", service);
  console.log("option param:", option);
  console.log("brand param:", brand);
  console.log("quantity param:", quantity);

  if (!userId || !selectedAddress) {
    console.warn("CartContext: missing userId or selectedAddress", { userId, selectedAddress });
    Alert.alert(
      "Error",
      "Please select an address and ensure you're logged in"
    );
    return;
  }

  try {
    setIsLoading(true);

    const payload: AddToCartPayload = {
      userId,
      serviceId: service?._id,
      zipcode: selectedAddress?.address?.zipcode,
      quantity,
      selectedOption: {
        optionId: option?._id,
      },
      ...(brand && {
        selectedBrand: {
          brandId: brand._id,
        },
      }),
    };

    // DEBUG: log payload before API call
    console.log("ADD_TO_CART PAYLOAD →", JSON.stringify(payload, null, 2));

    const response = await addToCartAPI(payload);
    console.log("addToCart API response:", response);

    if (response.success) {
      await fetchCart(); // Refresh from server
      Alert.alert("Success", "Item added to cart successfully");
    } else {
      console.warn("addToCart API returned success:false", response);
      Alert.alert("Error", response?.message || "Failed to add to cart");
    }
  } catch (error) {
    console.error("Error adding to cart (CartContext):", error);
    console.log("AXIOS ERROR DATA:", (error as any).response?.data);
    Alert.alert("Error", handleCartApiError(error));
  } finally {
    setIsLoading(false);
  }
}

  // ✅ SIMPLIFIED REMOVE FROM CART
  async function removeFromCart(itemId: string) {
    if (!userId) return;

    try {
      setIsLoading(true);
      const response = await removeCartItemAPI(userId, itemId);
      if (response.success) {
        await fetchCart(); // Refresh from server
        Alert.alert("Success", "Item removed from cart");
      }
    } catch (error) {
      console.error("Error removing from cart:", error);
      Alert.alert("Error", handleCartApiError(error));
    } finally {
      setIsLoading(false);
    }
  }

  // ✅ SIMPLIFIED UPDATE QUANTITY
  async function updateItemQuantity(itemId: string, quantity: number) {
    if (!userId) return;

    try {
      setIsLoading(true);
      const response = await updateCartItemQuantityAPI(userId, itemId, {
        quantity: quantity,
      });
      if (response.success) {
        await fetchCart(); // Refresh from server
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      Alert.alert("Error", handleCartApiError(error));
    } finally {
      setIsLoading(false);
    }
  }

  // ✅ SIMPLIFIED EMPTY CART
  function emptyCart() {
    if (!userId || isCartEmpty) return;

    Alert.alert("Empty Cart", "Do you wish to empty your cart?", [
      {
        text: "OK",
        style: "destructive",
        onPress: async () => {
          try {
            setIsLoading(true);
            const response = await clearCartAPI(userId);
            if (response.success) {
              setCartItems([]);
              Alert.alert("Success", "Cart cleared successfully");
            }
          } catch (error) {
            console.error("Error clearing cart:", error);
            Alert.alert("Error", handleCartApiError(error));
          } finally {
            setIsLoading(false);
          }
        },
      },
      { text: "Cancel", style: "cancel" },
    ]);
  }

  // ✅ SIMPLIFIED CHECK IF ITEM IN CART
  function isItemInTheCart(serviceName: string): boolean {
    return cartItems.some((item) => item.serviceName === serviceName);
  }

  const value = {
    cartItems,
    totalPrice,
    totalItems,
    isLoading,
    addToCart,
    isItemInTheCart,
    removeFromCart,
    emptyCart,
    updateItemQuantity,
    fetchCart,
    isCartEmpty,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
