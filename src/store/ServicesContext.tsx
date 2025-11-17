import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useState,
  useMemo,
  useContext,
} from "react";
import { ServiceBrand, OngoingService, ServiceData } from "../constants/types";
import { fetchMyBookedServices, fetchMyHistory } from "../utils/bookServiceAPI";
import { AuthContext } from "./AuthContext";




type ServicesContextProps = {
  // Original state
  services: ServiceData[];
  setServices: Dispatch<SetStateAction<ServiceData[]>>;
  ongoingServices: OngoingService[];
  setOngoingServices: Dispatch<SetStateAction<OngoingService[]>>;
  completedServices: OngoingService[];
  setCompletedServices: Dispatch<SetStateAction<OngoingService[]>>;
  brands : ServiceBrand[]
  setBrands: Dispatch<SetStateAction<ServiceBrand[]>>;
  // Memoized filtered services
  quickPickServices: ServiceData[];
  popularServices: ServiceData[];
  mostBookedServices: ServiceData[];
  dailyNeedServices: ServiceData[];
  activeServices: ServiceData[];
  servicesByCategory: { [key: string]: ServiceData[] };
  filteredOngoingServices : OngoingService[]

  //functions

  fetchOngoingServices: () => Promise<void>;
  fetchCompletedServices: () => Promise<void>;

  // Memoized filtered ongoing services

  // pendingServices: OngoingService[];
  // acceptedServices: OngoingService[];
  // inProgressServices: OngoingService[];
  // completedServices: OngoingService[];

  // Loading and error states (optional)
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
  error: string | null;
  setError: Dispatch<SetStateAction<string | null>>;
};

export const ServicesContext = createContext<ServicesContextProps>({
  services: [],
  setServices: () => {},
  ongoingServices: [],
  setOngoingServices: () => {},
  completedServices: [],
  setCompletedServices: () => {},
  brands : [],
  setBrands : ()=>{},
  quickPickServices: [],
  popularServices: [],
  mostBookedServices: [],
  dailyNeedServices: [],
  activeServices: [],
  servicesByCategory: {},
  fetchOngoingServices: async () => {},
  fetchCompletedServices: async () => {},
  filteredOngoingServices : [],
  // pendingServices: [],
  // acceptedServices: [],
  // inProgressServices: [],
  // completedServices: [],
  loading: false,
  setLoading: () => {},
  error: null,
  setError: () => {},
});

export default function ServicesContextProvider({
  children,
}: PropsWithChildren) {
  const [services, setServices] = useState<ServiceData[]>([]);
  const [ongoingServices, setOngoingServices] = useState<OngoingService[]>([]);
  const [completedServices, setCompletedServices] = useState<OngoingService[]>(
    []
  );
  const [brands, setBrands] = useState<ServiceBrand[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useContext(AuthContext);

  // Memoized filtered services - only recalculate when services array changes
  const activeServices = useMemo(
    () => services.filter((service) => service.availableInZipcode),
    [services]
  );

  const quickPickServices = useMemo(
    () => services.filter((service) => service.quickPick && service.availableInZipcode),
    [services]
  );

  const popularServices = useMemo(
    () => services.filter((service) => service.popular && service.availableInZipcode),
    [services]
  );

  const mostBookedServices = useMemo(
    () => services.filter((service) => service.mostBooked && service.availableInZipcode),
    [services]
  );

  const dailyNeedServices = useMemo(
    () => services.filter((service) => service.dailyNeed && service.availableInZipcode),
    [services]
  );

  // Group services by category - only recalculate when services change
  const servicesByCategory = useMemo(() => {
    const categorized: { [key: string]: ServiceData[] } = {};
    services
      .filter((service) => service.availableInZipcode)
      .forEach((service) => {
        if (!categorized[service.category.name]) {
          categorized[service.category.name] = [];
        }
        categorized[service.category.name].push(service);
      });
    return categorized;
  }, [services]);

  async function fetchOngoingServices() {
    try {
      const res = await fetchMyBookedServices(token);
      if (res.data?.active) {
        setOngoingServices(res.data.active);
      }
    } catch (e) {
      console.error("error fetching ongoing orders:", e);
    }
  }

  async function fetchCompletedServices() {
    try {
      const res = await fetchMyHistory(token);
      if (res.data?.history) {
        setCompletedServices(res.data.history);
      }
    } catch (e) {
      console.error("error fetching completed orders:", e);
    }
  }


  const filteredOngoingServices = useMemo(() => {
  return ongoingServices.filter(service =>
    ["pending", "accepted", "in-progress"].includes(service.status)
  );
}, [ongoingServices]);

  // Memoized filtered ongoing services - only recalculate when ongoingServices changes
  // const pendingServices = useMemo(() =>
  //   ongoingServices.filter(service => service.status === "pending"),
  //   [ongoingServices]
  // );

  // const acceptedServices = useMemo(() =>
  //   ongoingServices.filter(service => service.status === "accepted"),
  //   [ongoingServices]
  // );

  // const inProgressServices = useMemo(() =>
  //   ongoingServices.filter(service => service.status === "in-progress"),
  //   [ongoingServices]
  // );

  // const completedServices = useMemo(() =>
  //   ongoingServices.filter(service => service.status === "completed"),
  //   [ongoingServices]
  // );

  const value = {
    // Original state
    services,
    setServices,
    ongoingServices,
    setOngoingServices,
    completedServices,
    setCompletedServices,
    brands,
    setBrands,

    // Memoized filtered services
    filteredOngoingServices,
    activeServices,
    quickPickServices,
    popularServices,
    mostBookedServices,
    dailyNeedServices,
    servicesByCategory,

    //functions
    fetchOngoingServices,
    fetchCompletedServices,

    // Memoized filtered ongoing services
    // pendingServices,
    // acceptedServices,
    // inProgressServices,
    // completedServices,

    // Loading and error states
    loading,
    setLoading,
    error,
    setError,
  };

  return (
    <ServicesContext.Provider value={value}>
      {children}
    </ServicesContext.Provider>
  );
}

// Custom hook for easier usage
export const useServices = (): ServicesContextProps => {
  const context = useContext(ServicesContext);
  if (!context) {
    throw new Error(
      "useServices must be used within a ServicesContextProvider"
    );
  }
  return context;
};
