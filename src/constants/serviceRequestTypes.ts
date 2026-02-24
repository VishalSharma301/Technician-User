import { JobStatusHistoryItem } from "./timelineTypes";

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
  inspection? : Inspection;
  computedInvoice? : ComputedInvoice;
  statusHistory?: JobStatusHistoryItem[];
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
  showReview ?: boolean | string;
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
/* ===========================
   Inspection Completion Type
=========================== */

export enum InspectionCompletionType {
  COMPLETED = "completed",
  PARTS_PENDING = "parts_pending",
  AT_WORKSHOP = "at_workshop",
}


/* ===========================
   Additional Services
=========================== */

export interface InspectionAdditionalService {
  _id: string;
  serviceName: string;
  description?: string;
  notes?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  isCustom: boolean;
  addedAt: string; // ISO Date
}


/* ===========================
   Used Parts
=========================== */

export interface InspectionUsedPart {
  _id: string;
  inventoryItem?: string; // ObjectId reference
  productCode: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalWithoutGst: number;
  gst: number;
  gstAmount: number;
  totalWithGst: number;
  isCustom: boolean;
  addedAt: string; // ISO Date
}


/* ===========================
   Required Parts (Parts Pending)
=========================== */

export interface RequiredPart {
  partName: string;
  quantity: number;
  estimatedCost: number;
  supplier: string;
  notes?: string;
}


/* ===========================
   Parts Pending Object
=========================== */

export type EstimatedAvailability =
  | "same_day"
  | "within_week"
  | "custom";

export interface InspectionPartsPending {
  createdAt: string; // ISO Date
  estimatedAvailability: EstimatedAvailability;
  customAvailabilityDate?: string | null;
  expectedReturnDate: string; // ISO Date
  requiredParts: RequiredPart[];
  technicianNotified: boolean;
}


/* ===========================
   Totals
=========================== */

export interface InspectionTotals {
  originalService: number;
  additionalServices: number;
  parts: number;
  grandTotal: number;
}


/* ===========================
   Main Inspection Interface
=========================== */

export interface Inspection {
  status: "in_progress" | "completed" | "parts_pending" | "at_workshop";

  findings?: string;

  startedAt: string; // ISO Date

  completionType?: InspectionCompletionType;
workshopDetails? : WorkshopDetails;
  additionalServices: InspectionAdditionalService[];
  usedParts: InspectionUsedPart[];

  partsPending?: InspectionPartsPending;

  totals: InspectionTotals;

  verificationRequested: boolean;
  verificationRequestedAt?: string;

  userVerified: boolean;
  userVerifiedAt?: string;

  userVerificationRejected: boolean;
}
export type EstimatedCompletionTime =
  | "same_day"
  | "1-2_days"
  | "3-5_days"
  | "1_week"
  | "custom";

export interface WorkshopDetails {
  afterRepairPhotos: string[];
  beforeRepairPhotos: string[];
  createdAt: string;
  customCompletionDate: string | null;
  droppedOffAt: string;
  estimatedCompletionTime: EstimatedCompletionTime;
  estimatedCost: number;
  expectedReturnDate: string;
  itemDescription: string;
  notes: string;
  repairRequired: string;
  technicianNotified: boolean;
}



// invoice.types.ts

export interface AdditionalServiceItem {
  description: string | null;
  isCustom: boolean;
  notes: string | null;
  quantity: number;
  selectedOption: string | null;
  serviceId: string;
  serviceName: string;
  totalPrice: number;
  unitPrice: number;
}

export interface AdditionalServices {
  count: number;
  items: AdditionalServiceItem[];
  subtotal: number;
}

export interface ServicePricing {
  appliedPriceType: string;
  basePrice: number;
  calculation: string;
  name: string;
  quantity: number;
  total: number;
  type: string;
  unitPrice: number;
}

export interface PriceBreakdown {
  servicePricing: ServicePricing;
  subServicesPricing: SubServicePricing[];
  subtotal: number;
  summary: string;
  total: number;
}

export interface OriginalService {
  basePrice: number;
  name: string;
  priceBreakdown: PriceBreakdown;
  quantity: number;
  selectedBrand: string | null;
  selectedOption: string | null;
}

export interface PartItem {
  description: string | null;
  gstAmount: number;
  gstPercent: number;
  isCustom: boolean;
  partId: string;
  productCode: string;
  productName: string;
  quantity: number;
  totalWithGst: number;
  totalWithoutGst: number;
  unitPrice: number;
}

export interface Parts {
  count: number;
  items: PartItem[];
  subtotal: number;
}

export interface RequiredPart {
  estimatedCost: number;
  notes?: string;
  partName: string;
  quantity: number;
  supplier: string;
}

export interface PendingEstimates {
  estimatedAvailability: string;
  estimatedTotal: number;
  expectedReturnDate: string;
  requiredParts: RequiredPart[];
  type: string;
}

export interface Totals {
  additionalServices: number;
  grandTotal: number;
  originalService: number;
  parts: number;
}

export interface Meta {
  completionType: string;
  jobFinalPrice: number;
  paymentStatus: string;
  pinVerified: boolean;
  userVerified: boolean;
  verificationRequested: boolean;
}

export interface ComputedInvoice {
  additionalServices: AdditionalServices;
  meta: Meta;
  originalService: OriginalService;
  parts: Parts;
  pendingEstimates: PendingEstimates;
  totals: Totals;
}

