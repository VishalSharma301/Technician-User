

export type Coordinates = {
  lat: number;
  lon: number;
};

export type Address = {
  street: string;
  city: string;
  state: string;
  zipcode: string;
  coordinates: Coordinates;
};

export type AddressCardType = {
  label: string;
  address: Address;
  phone: string;
};

export type ServiceDetailsData = {
  mainType: string;
  subType: string | null;
  isMakingNoise: string | null;
  image:  null | undefined;
  notes: string | undefined | null;
};

export type ItemData = {
  _id : string
  name: string;
  mainType: string;
  subType: string | null;
  isMakingNoise: string | null;
  image: string | undefined | null;
  notes: string | undefined | null;
  price: number | string;
  description: string;
  quantity: number;
  address: Address;
  phone: string;
  createdAt: string | null | undefined;
};

export type OngoingService = {
  __v: number;
  _id: string;
  address: Address;
  completionPin: string;
  createdAt: string; // ISO string
  notes: string;
  pinVerified: boolean;
  requestSubmittedAt: string; // ISO string
  scheduledDate: string; // ISO string
  service: string | null; // could be populated later
  status: "pending" | "accepted" | "in-progress" | "completed" | "cancelled";
  user: string; // userId
  zipcode: string;
};

export type UserProfile = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  zipcode?: string;
  name?: string;
  isVerified: boolean;
  isNewUser: boolean;
  previousRequests: any[]; // can refine if backend defines request schema
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  __v?: number;
};

export type NotificationData = {
  id: string;
  title: string;
  body: string;
  data?: any;
  receivedAt: string;
  read: boolean;
};


// ✅ UNIFIED: Single cart item type
export type CartItemLocal = {
  _id: string;              // Cart item ID from API
  serviceId: string;       // Service ID
  serviceName: string;     // Service name
  quantity: number;        // Quantity
  basePrice: number;       // Price per unit
  totalPrice: number;      // Total for this item
  selectedBrand?: string;  // Optional brand name
  
};


export type ServiceOption = {
  _id: string;
  name: string;
  singlePrice: number;
  doublePrice: number;
  triplePrice: number;
}

export type ServiceBrand = {
  _id: string;
  name: string;
  description: string;
  logo: string;
}

export type ServiceCategory = {
  _id: string;
  name: string;
  icon: string;
}

export type ServiceData = {
  _id: string;
  name: string;
  description: string;
  estimatedTime: string;
  icon: string;
  specialty: string;
  slug: string;
  subcategoryName: string;
  mostBooked: boolean;
  popular: boolean;
  dailyNeed: boolean;
  quickPick: boolean;
  availableInZipcode: boolean;
  providerCount: number;
  basePrice: number;
  category: ServiceCategory;
  options: ServiceOption[];
  brands: ServiceBrand[];
  subServices: any[]; // or define a proper type if subServices have structure later
}




export type AddToCartPayload = {
  userId: string;
  serviceId: string;
  zipcode: string;
  selectedOption: {
    optionId: string;
  };
  selectedSubServices?: Array<{
    subServiceId: string;
    name: string;
    price: number;
  }>;
  selectedBrand?: {
    brandId: string;
  };
  quantity?: number;
}