// navigation.ts (your constants file)

import { ServiceRequest } from "./serviceRequestTypes";
import { ServiceData } from "./types";

export type RootStackParamList = {
  SplashScreen: undefined;
  LoadingScreen: undefined;
  LoginScreen: undefined;
  VerificationScreen: undefined;
  ResetPasswordScreen: undefined;
  AuthenticatedTabs: undefined; // tabs entry point
  SelectLocationScreen: undefined;
};

// Stack used inside Tabs for Home
export type HomeStackParamList = {
  HomeScreen: undefined;
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

// Tabs
export type HomeTabParamList = {
  HomeStack: undefined;
  CategoryScreen: undefined;
  JobsScreen: undefined;
  OrderStack: undefined;
  CartScreen: undefined;
};
