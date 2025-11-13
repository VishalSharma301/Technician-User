import AsyncStorage from "@react-native-async-storage/async-storage";

interface userData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber : string
  _id : string
}

export async function saveProfileData(userProfileData: userData) {
  try {
    // ✅ CHANGED: Get existing profile data
    const existingProfileStr = await AsyncStorage.getItem("profileData");
    const existingProfile = existingProfileStr ? JSON.parse(existingProfileStr) : {};

    // ✅ CHANGED: Merge old data with new data
    const updatedProfile = { ...existingProfile, ...userProfileData };

    // ✅ CHANGED: Save merged data
    await AsyncStorage.setItem("profileData", JSON.stringify(updatedProfile));

    console.log("Saved Profile Data", updatedProfile);
  } catch (err) {
    console.error("Error saving profile data", err);
  }
}


export async function getProfileData(): Promise<userData | null> {
  try {
    const profileData = await AsyncStorage.getItem("profileData");
    console.log("Loaded profile data:", profileData);

    return profileData ? JSON.parse(profileData) : null;
  } catch (err) {
    console.error("Error getting profile data", err);
    return null; // ✅ ensure we always return null on error
  }
}


export async function getToken(): Promise<string | null> {
  try {
    const storedToken = await AsyncStorage.getItem("token");
    if (storedToken) {
      console.log("Got token:", storedToken);
      return storedToken;
    }
    return null; // ✅ return null if no token is found
  } catch (error) {
    console.error("Error fetching token:", error);
    return null; // ✅ return null on error
  }
}
