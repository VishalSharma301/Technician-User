import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useCallback,
} from "react";
import {
  ServiceRequest,
  ServiceRequestsResponse,
  ServiceRequestQueryParams,
  ServiceRequestStats,
  Pagination,
} from "../constants/serviceRequestTypes";
import { getServiceRequests } from "../utils/ServiceRequestsApis";

interface ServiceRequestsContextType {
  serviceRequests: ServiceRequest[];
  stats: ServiceRequestStats | null;
  pagination: Pagination | null;
  loading: boolean;
  error: string | null;
  currentFilters: ServiceRequestQueryParams;
  fetchServiceRequests: (params?: ServiceRequestQueryParams) => Promise<void>;
  refreshServiceRequests: () => Promise<void>;
  loadMoreServiceRequests: () => Promise<void>;
  updateFilters: (filters: ServiceRequestQueryParams) => void;
  clearFilters: () => void;
}

const ServiceRequestsContext = createContext<
  ServiceRequestsContextType | undefined
>(undefined);

export const useServiceRequests = () => {
  const context = useContext(ServiceRequestsContext);
  if (!context) {
    throw new Error(
      "useServiceRequests must be used within ServiceRequestsProvider"
    );
  }
  return context;
};

interface ServiceRequestsProviderProps {
  children: ReactNode;
}

export const ServiceRequestsProvider: React.FC<
  ServiceRequestsProviderProps
> = ({ children }) => {
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [stats, setStats] = useState<ServiceRequestStats | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentFilters, setCurrentFilters] =
    useState<ServiceRequestQueryParams>({
      page: 1,
      limit: 10,
      sortBy: "createdAt",
      sortOrder: "desc",
    });

  const fetchServiceRequests = useCallback(
    async (params?: ServiceRequestQueryParams) => {
      try {
        setLoading(true);
        setError(null);

        const filters = params || currentFilters;
        const response: ServiceRequestsResponse = await getServiceRequests(
          filters
        );

        if (response.success) {
          // If it's the first page, replace the data
          if (filters.page === 1) {
            requestAnimationFrame(() => {
              setServiceRequests(response.data);
              setStats(response.stats);
              setPagination(response.pagination);
            });
          } else {
            requestAnimationFrame(() => {
              setServiceRequests((prev) => [...prev, ...response.data]);
              setStats(response.stats);
              setPagination(response.pagination);
            });
          }
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to fetch service requests";
        setError(errorMessage);
        console.error("Fetch Service Requests Error:", err);
      } finally {
        setLoading(false);
      }
    },
    [currentFilters]
  );

  const refreshServiceRequests = useCallback(async () => {
    const refreshFilters = { ...currentFilters, page: 1 };
    await fetchServiceRequests(refreshFilters);
  }, [currentFilters, fetchServiceRequests]);

  const loadMoreServiceRequests = useCallback(async () => {
    // Prevent multiple simultaneous requests
    if (!pagination?.hasNextPage || loading) return;

    // Add additional safety check
    if (serviceRequests.length === 0) return;

    const nextPageFilters = {
      ...currentFilters,
      page: (currentFilters.page || 1) + 1,
    };

    await fetchServiceRequests(nextPageFilters);
  }, [
    pagination,
    loading,
    currentFilters,
    serviceRequests.length,
    fetchServiceRequests,
  ]);

  const updateFilters = useCallback(
    (filters: ServiceRequestQueryParams) => {
      const newFilters = { ...currentFilters, ...filters, page: 1 };
      fetchServiceRequests(newFilters);
    },
    [currentFilters, fetchServiceRequests]
  );

  const clearFilters = useCallback(() => {
    const defaultFilters: ServiceRequestQueryParams = {
      page: 1,
      limit: 10,
      sortBy: "createdAt",
      sortOrder: "desc",
    };
    fetchServiceRequests(defaultFilters);
  }, [fetchServiceRequests]);

  const value: ServiceRequestsContextType = {
    serviceRequests,
    stats,
    pagination,
    loading,
    error,
    currentFilters,
    fetchServiceRequests,
    refreshServiceRequests,
    loadMoreServiceRequests,
    updateFilters,
    clearFilters,
  };

  return (
    <ServiceRequestsContext.Provider value={value}>
      {children}
    </ServiceRequestsContext.Provider>
  );
};
