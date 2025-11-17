export type Cart = {
  _id: string;
  user: string;
  zipcode: string;
  totalItems: number;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
  lastModified: string;
  __v: number;
  items: CartItemType[];
};

export type CartItemType ={
  _id: string;
  service: CartService;
  selectedOption: SelectedOption;
  selectedSubServices: SelectedSubService[];
  selectedBrand?: SelectedBrand;
  quantity: number;
  basePrice: number;
  optionPrice: number;
  subServicesPrice: number;
  itemTotal: number;
  suggestedProvider?: SuggestedProvider;
  priceDescription: PriceDescription;
  subtotal?: number;
  summary?: string;
  total?: number;
  createdAt: string;
  updatedAt: string;
}

interface PriceDescription {
  items: PriceDescriptionItem[]; // array of line items
  subtotal: number;
  summary?: string;
  total?: number;
}

interface PriceDescriptionItem {
  name: string;
  type: string; // e.g. "service"
  quantity: number;
  basePrice: number;
  appliedPrice: number;
  calculation?: string; // e.g. "₹400 × 2"
  total: number;
}

interface CartService {
  _id: string;
  name: string;
  description: string;
  estimatedTime: string;
  icon: string;
  category: ServiceCategory;
  options: ServiceOption[];
  subServices: any[]; // or define structure if available
}

interface ServiceCategory {
  _id: string;
  name: string;
  icon: string;
}

interface ServiceOption {
  _id: string;
  name: string;
  description: string;
  icon: string;
  basePrice: number;
  estimatedTime: string;
  isActive: boolean;
}

interface SelectedOption {
  optionId: string;
  name: string;
}

interface SelectedBrand {
  brandId: {
    _id: string;
    name: string;
    logo: string;
  };
  name?: string;
}

interface SelectedSubService {
  _id: string;
  name: string;
  price?: number;
}

interface SuggestedProvider {
  _id: string;
  name: string;
  rating: number;
}
