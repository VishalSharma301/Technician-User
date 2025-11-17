import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useState,
} from "react";
import { AddressCardType } from "../constants/types";

const initialAddresses: AddressCardType[] = [
  {
    label: "Home",
    address: {
      street: "123 Lane",
      city: "Morinda",
      state: "Punjab",
      zipcode: "140802",
      coordinates: { lat: 19.076, lon: 72.8777 },
    },
    phone: "+91-2454657787",
  },
];

interface AddressContext {
  addresses: AddressCardType[];
  setAddresses: Dispatch<SetStateAction<AddressCardType[]>>;
  selectedAddress: AddressCardType;
  setSelectedAddress: Dispatch<SetStateAction<AddressCardType>>;
  setZipcode : (zipcode : string)=>void
}

export const AddressContext = createContext<AddressContext>({
  addresses: [],
  setAddresses: () => {},
  selectedAddress: {
    label: "",
    address: {
      city: "",
      state: "",
      street: "",
      zipcode: "140802",
      coordinates: { lat: 0, lon: 0 },
    },
    phone: "",
  },
  setSelectedAddress: () => {},
  setZipcode : ()=>{}
});

export default function AddressContextProvider({
  children,
}: PropsWithChildren) {
  const [addresses, setAddresses] = useState(initialAddresses);
  const [selectedAddress, setSelectedAddress] = useState({
    label: "",
    address: {
      city: "",
      state: "",
      street: "",
      zipcode: "140802",
      coordinates: { lat: 0, lon: 0 },
    },
    phone: "",
  });

  const setZipcode = (zipcode : string) => {
  setSelectedAddress(prev => ({
    ...prev,
    address: {
      ...prev.address,
      zipcode,
    }
  }));
};



  const value = {
    addresses,
    selectedAddress,
    setAddresses,
    setSelectedAddress,
    setZipcode
  };

  return (
    <AddressContext.Provider value={value}>{children}</AddressContext.Provider>
  );
}
