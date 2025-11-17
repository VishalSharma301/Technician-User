import { useContext } from "react";
import { AuthContext } from "../store/AuthContext";
import { CartContext } from "../store/CartContext";

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within an CartContextProvider");
  }

  return context;
}
