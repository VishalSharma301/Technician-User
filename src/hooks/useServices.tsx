import { useContext } from "react";
import { ServicesContext } from "../store/ServicesContext";

export function useServices() {
  const context = useContext(ServicesContext);

  if (!context) {
    throw new Error("useServices must be used within an ServiceContextProvider");
  }

  return context;
}
