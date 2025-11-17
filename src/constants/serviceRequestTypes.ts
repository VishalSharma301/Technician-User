export interface Coordinates {
  lat: number;
  lon: number;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipcode: string;
  coordinates: Coordinates;
}

export interface Category {
  _id: string;
  name: string;
  icon: string;
}

export interface Service {
  _id: string;
  name: string;
  category: Category;
  icon: string;
  basePrice: number;
  description: string;
  estimatedTime: string;
}

export interface Provider {
  _id: string;
  name: string;
  companyName: string;
  phoneNumber: string;
  rating: number;
  logo: string;
}

export interface Technician {
  _id: string;
  name: string;
  phoneNumber: string;
  skills: string[];
  profilePicture: string;
  status: string;
}

export interface SelectedOption {
  optionId: string;
  name: string;
  price: number;
}

export interface SelectedSubService {
  subServiceId: string;
  name: string;
  price: number;
}

export interface Brand {
  _id: string;
  name: string;
  logo: string;
}

export interface SelectedBrand {
  brandId: Brand;
  name: string;
}

export interface ServicePricing {
  type: string;
  name: string;
  basePrice: number;
  doublePrice: number;
  triplePrice: number;
  appliedPriceType: string;
  quantity: number;
  unitPrice: number;
  total: number;
  calculation: string;
}

export interface SubServicePricing {
  name: string;
  price: number;
  quantity: number;
  total: number;
  calculation: string;
}

export interface PriceBreakdown {
  servicePricing: ServicePricing;
  subServicesPricing: SubServicePricing[];
  subtotal: number;
  total: number;
  summary: string;
}

export type ServiceRequestStatus =
  | "pending"
  | "booked"
  | "assigned"
  | "technician_assigned"
  | "in_progress"
  | "completed"
  | "cancelled";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface ServiceRequest {
  _id: string;
  user: string;
  service: Service;
  provider?: Provider;
  technician?: Technician;
  selectedOption?: SelectedOption;
  selectedSubServices: SelectedSubService[];
  selectedBrand?: SelectedBrand;
  quantity: number;
  status: ServiceRequestStatus;
  scheduledDate: string;
  scheduledTimeSlot: string;
  zipcode: string;
  address: Address;
  basePrice: number;
  optionPrice: number;
  subServicesPrice: number;
  finalPrice: number;
  priceBreakdown: PriceBreakdown;
  notes?: string;
  specialInstructions?: string;
  completionPin: string;
  pinVerified: boolean;
  requestSubmittedAt: string;
  serviceStartedAt?: string;
  serviceCompletedAt?: string;
  bookedAt?: string;
  providerAssignedAt?: string;
  technicianAssignedAt?: string;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceRequestStats {
  totalRequests: number;
  pending: number;
  booked: number;
  assigned: number;
  technicianAssigned: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  totalSpent: number;
  pendingPayments: number;
}

export interface AppliedFilters {
  status?: ServiceRequestStatus | null;
  paymentStatus?: PaymentStatus | null;
  search?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalRequests: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ServiceRequestsResponse {
  success: boolean;
  data: ServiceRequest[];
  pagination: Pagination;
  stats: ServiceRequestStats;
  appliedFilters: AppliedFilters;
}

export interface ServiceRequestQueryParams {
  page?: number;
  limit?: number;
  status?: ServiceRequestStatus;
  paymentStatus?: PaymentStatus;
  search?: string;
  startDate?: string;
  endDate?: string;
  bookedAfter?: string;
  bookedBefore?: string;
  completedAfter?: string;
  completedBefore?: string;
  minPrice?: number;
  maxPrice?: number;
  categoryId?: string;
  hasProvider?: boolean;
  hasTechnician?: boolean;
  pinVerified?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  upcoming?: boolean;
  past?: boolean;
  active?: boolean;
}
