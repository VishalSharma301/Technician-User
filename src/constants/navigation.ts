// navigation.ts (your constants file)

import { ServiceRequest } from "./serviceRequestTypes";
import { AddressCardType, ServiceData } from "./types";

export type RootStackParamList = {
  SplashScreen: undefined;
  LoadingScreen: undefined;
  LoginScreen: undefined;
  VerificationScreen: undefined;
  ResetPasswordScreen: undefined;
  AuthenticatedTabs: undefined; // tabs entry point
  SelectLocationScreen: undefined;
  InitialLocationSelector: undefined;
};

// Stack used inside Tabs for Home
export type HomeStackParamList = {
  HomeScreen: undefined;
  CoinScreen: undefined;
  NotificationScreen: undefined;
  ProfileScreen: undefined;

  // NEW Address System Screens
  Location: undefined;
  Addresses: undefined;
  AddAddress:
    | {
        edit?: boolean;
        index?: number;
        item?: any;
      }
    | undefined;
};

export type OrderStackParamList = {
  OrderScreen: undefined;
  OrderDetailsScreen:
     {
        item: ServiceRequest;
      }
  
};
export type ProfileStackParamList = {
  ProfileScreen: undefined;
  EditProfileScreen: undefined;
  HelpAndSupportScreen: undefined;
  MyAddressesScreen: undefined;
  AccountHealthScreen: undefined;
  SelectDeliveryLocationScreen: { address?: AddressCardType; isEditing?: boolean } | undefined;
};

// Tabs
export type HomeTabParamList = {
  HomeStack: undefined;
  ProfileStack: undefined;
  JobsScreen: undefined;
  OrderStack: undefined;
  CartScreen: undefined;
};
