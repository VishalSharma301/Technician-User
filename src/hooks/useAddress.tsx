import { useContext } from "react";
import { AddressContext } from "../store/AddressContext";

export function useAddress() {
  const context = useContext(AddressContext);

  if (!context) {
    throw new Error("useAddress must be used within an AddressContextProvider");
  }

  return context;
}
