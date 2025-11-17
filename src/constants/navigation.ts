// navigation.ts (your constants file)

export type RootStackParamList = {
  SplashScreen: undefined;
  LoadingScreen: undefined;
  LoginScreen: undefined;
  VerificationScreen: undefined;
  AuthenticatedTabs: undefined; // tabs entry point
};

// Stack used inside Tabs for Home
export type HomeStackParamList = {
  HomeScreen: undefined;
  ProfileScreen: undefined;
};

// Tabs
export type HomeTabParamList = {
  HomeStack: undefined;
  CategoryScreen: undefined;
  JobsScreen: undefined;
  OrderScreen: undefined;
  CartScreen: undefined;
};
