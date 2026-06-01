import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

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
  id: string;
  label: string;
  address: Address;
  phone: string;
};


interface AddressContext {
  addresses: AddressCardType[];
  setAddresses: Dispatch<SetStateAction<AddressCardType[]>>;
  selectedAddress: AddressCardType;
  setSelectedAddress: Dispatch<SetStateAction<AddressCardType>>;
  setZipcode: (zipcode: string) => void;
  currentZipcodeAddresses: AddressCardType[];
  generateAddressId: () => string;
   isLoadingAddresses: boolean;
}

const ADDRESS_STORAGE_KEY = "saved_addresses";

export const AddressContext = createContext<AddressContext>({
  addresses: [],
  setAddresses: () => {},
  selectedAddress: {
    id: "",
    label: "",
    address: {
      city: "",
      state: "",
      street: "",
      zipcode: "",
      coordinates: { lat: 0, lon: 0 },
    },
    phone: "",
  },
  setSelectedAddress: () => {},
  setZipcode: () => {},
  currentZipcodeAddresses: [],

  generateAddressId: () => "",
  isLoadingAddresses: false,
});

export default function AddressContextProvider({
  children,
}: PropsWithChildren) {
  const [addresses, setAddresses] = useState<AddressCardType[]>([]);
  const [hasLoadedStorage, setHasLoadedStorage] = useState(false);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const [selectedAddress, setSelectedAddress] = useState({
    id: "",
    label: "",
    address: {
      city: "",
      state: "",
      street: "",
      zipcode: "",
      coordinates: { lat: 0, lon: 0 },
    },
    phone: "",
  });

  const saveAddressesToStorage = async (addresses: AddressCardType[]) => {
    try {
      await AsyncStorage.setItem(
        ADDRESS_STORAGE_KEY,
        JSON.stringify(addresses),
      );
    } catch (e) {
      console.log("Error saving addresses:", e);
    }
  };
  const loadAddressesFromStorage = async () => {
    try {
      const stored = await AsyncStorage.getItem(ADDRESS_STORAGE_KEY);

      if (!stored) return [];

      return JSON.parse(stored) as AddressCardType[];
    } catch (e) {
      console.log("Error loading addresses:", e);
      return [];
    } finally {
      // ✅ Load addresses on mount
    }
  };

  console.log('addresses :', addresses);
  

  useEffect(() => {
    if (!hasLoadedStorage) return;

    saveAddressesToStorage(addresses);
  }, [addresses, hasLoadedStorage]);

 useEffect(() => {
  const loadAddresses = async () => {
    try {
      setIsLoadingAddresses(true);

      console.log("Loading addresses from storage...");

      const storedAddresses = await loadAddressesFromStorage();

      if (storedAddresses.length > 0) {
        setAddresses(storedAddresses);
        setSelectedAddress(storedAddresses[0]);
      }
    } finally {
      setHasLoadedStorage(true);
      setIsLoadingAddresses(false);
    }
  };

  loadAddresses();
}, []);

  const currentZipcodeAddresses = useMemo(
  () => addresses.filter(addr => addr.address.zipcode === selectedAddress.address.zipcode),
  [addresses, selectedAddress.address.zipcode]
);
const setZipcode = useCallback((zipcode: string) => {
  setSelectedAddress(prev => ({ ...prev, address: { ...prev.address, zipcode } }));
}, []);

const generateAddressId = useCallback(
  () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
  []
);

  const value = {
    addresses,
    selectedAddress,
    setAddresses,
    setSelectedAddress,
    setZipcode,
    currentZipcodeAddresses,
    generateAddressId,
    isLoadingAddresses
  };

  return (
    <AddressContext.Provider value={value}>{children}</AddressContext.Provider>
  );
}
