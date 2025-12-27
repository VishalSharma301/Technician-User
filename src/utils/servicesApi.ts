import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE } from "./BASE_URL";
import axios, { AxiosError } from "axios";

const API_URL = `${BASE}/api/users/get-all-services`;

export async function fetchServices({
  page = 1,
  limit = 100,
  popular,
  category,
  isActive,
  zipcode = 140802,
}: {
  page?: number;
  limit?: number;
  popular?: boolean;
  category?: string;
  isActive?: boolean;
  zipcode?: string | number;
}) {
  try {
    console.log("📡 Fetching services...");

    // 2. Build query params safely
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("limit", limit.toString());
    params.append("zipcode", zipcode.toString());

    if (popular !== undefined) params.append("popular", String(popular));
    if (category) params.append("category", category);
    if (isActive !== undefined) params.append("isActive", String(isActive));

    const finalURL = `${API_URL}?${params.toString()}`;
    console.log("🌐 URL:", finalURL);

    // 3. Call API
    const response = await fetch(finalURL, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    }).catch((err) => {
      throw new Error(`Network request failed: ${err.message}`);
    });

    // 4. Read raw text
    const rawText = await response.text();

    // 5. Handle HTTP status errors
    if (!response.ok) {
      throw new Error(
        `❌ Server responded with status ${response.status} (${response.statusText}): ${rawText}`
      );
    }

    if (!rawText || rawText.trim() === "") {
      throw new Error("❌ Empty response received from server.");
    }

    // 6. Parse JSON safely
    let data: any;
    try {
      data = JSON.parse(rawText);
    } catch (err) {
      throw new Error(`❌ Failed to parse JSON: ${(err as Error).message}`);
    }

    // 7. Validate expected structure
    if (!data || typeof data !== "object") {
      throw new Error("❌ Invalid response structure: Root is not an object.");
    }

    if (!Array.isArray(data.services)) {
      throw new Error(
        "❌ Invalid response: 'services' key missing or not an array."
      );
    }

    console.log("✅ Fetched services:", data.services.length);
    return data;
  } catch (error: any) {
    console.error("❌ Error fetching services:", error.message || error);
    throw new Error(error.message || "Unexpected error fetching services.");
  }
}

const API = axios.create({
  baseURL: `${BASE}/api/users`,
});

export const cancelServiceRequest = async (
  requestId: string,
  reason: string,
  token: string
) => {
  try {
    const { data } = await API.put(
      `/cancel-service-request/${requestId}`,
      { reason },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return data;
  } catch (error: any) {
    throw (
      error.response?.data?.message ||
      error.message ||
      "Failed to cancel service request"
    );
  }
};

export async function fetchServicesByZip(zipcode: string) {
  // ✅ 1. Validate input
  if (!zipcode || zipcode.trim().length !== 6) {
    throw new Error("Invalid zipcode. Must be a 6-digit string.");
  }

  try {
    const response = await axios.get(`${BASE}/api/users/services`, {
      params: { zipcode },
      timeout: 10000, // ✅ 2. Prevent hanging requests
    });

    // ✅ 3. Check for proper status
    if (response.status !== 200) {
      throw new Error(`Unexpected response status: ${response.status}`);
    }

    // ✅ 4. Validate response structure
    // if (!response.data || !Array.isArray(response.data)) {
    //   throw new Error("Invalid response format: expected an array of services");
    // }

    return response.data;
  } catch (error) {
    // ✅ 5. Handle different error types
    if (axios.isAxiosError(error)) {
      const axiosErr = error as AxiosError;

      if (axiosErr.response) {
        // server responded with error
        console.error("❌ Server Error:", axiosErr.response.data);
        throw new Error(
          `Server error (${axiosErr.response.status}): ${JSON.stringify(
            axiosErr.response.data
          )}`
        );
      } else if (axiosErr.request) {
        // no response from server
        console.error("❌ No response received:", axiosErr.request);
        throw new Error("No response received from server");
      } else {
        // something went wrong in setup
        console.error("❌ Request setup error:", axiosErr.message);
        throw new Error(axiosErr.message);
      }
    } else {
      // non-axios error
      console.error("❌ Unexpected Error:", error);
      throw new Error("An unexpected error occurred");
    }
  }
}

export async function fetchBrandsByZip(zipcode: string) {
  try {
    const response = await axios.get(`${BASE}/api/test/users/brands`, {
      params: { zipcode },
      timeout: 10000,
    });
    console.log(response.data ? "brands fetched " : "brands fetch failed");

    return response.data;
  } catch (error) {
    // ✅ 5. Handle different error types
    if (axios.isAxiosError(error)) {
      const axiosErr = error as AxiosError;

      if (axiosErr.response) {
        // server responded with error
        console.error("❌ Server Error:", axiosErr.response.data);
        throw new Error(
          `Server error (${axiosErr.response.status}): ${JSON.stringify(
            axiosErr.response.data
          )}`
        );
      } else if (axiosErr.request) {
        // no response from server
        console.error("❌ No response received:", axiosErr.request);
        throw new Error("No response received from server");
      } else {
        // something went wrong in setup
        console.error("❌ Request setup error:", axiosErr.message);
        throw new Error(axiosErr.message);
      }
    } else {
      // non-axios error
      console.error("❌ Unexpected Error:", error);
      throw new Error("An unexpected error occurred");
    }
  }
}

export async function fetchServiceDetails(serviceId: string, zipcode: string) {
  try {
    console.log("API : ", `${BASE}/api/users/services/${serviceId}?zipcode=${zipcode}`);
    
    const response = await axios.get(
      `${BASE}/api/users/services/${serviceId}`,
      {
        params: { zipcode },
        timeout: 10000,
      }
    );
    // console.log('details fetched : ', response.data);

    return response.data;
  } catch (error) {
    // ✅ 5. Handle different error types
    if (axios.isAxiosError(error)) {
      const axiosErr = error as AxiosError;

      if (axiosErr.response) {
        // server responded with error
        console.error("❌ Server Error:", axiosErr.response.data);
        throw new Error(
          `Server error (${axiosErr.response.status}): ${JSON.stringify(
            axiosErr.response.data
          )}`
        );
      } else if (axiosErr.request) {
        // no response from server
        console.error("❌ No response received:", axiosErr.request);
        throw new Error("No response received from server");
      } else {
        // something went wrong in setup
        console.error("❌ Request setup error:", axiosErr.message);
        throw new Error(axiosErr.message);
      }
    } else {
      // non-axios error
      console.error("❌ Unexpected Error:", error);
      throw new Error("An unexpected error occurred");
    }
  }
}
export async function newServiceDetails(serviceId: string, zipcode: string) {
  try {
     console.log("API : ", `${BASE}/api/test/services/${serviceId}/get-details/conversation?zipcode=${zipcode}`);
    const response = await axios.get(
      `${BASE}/api/test/services/${serviceId}/get-details/conversation`,
      {
        params: { zipcode },
        timeout: 10000,
      }
    );
    // console.log('details fetched : ', response.data);

    return response.data;
  } catch (error) {
    // ✅ 5. Handle different error types
    if (axios.isAxiosError(error)) {
      const axiosErr = error as AxiosError;

      if (axiosErr.response) {
        // server responded with error
        console.error("❌ Server Error:", axiosErr.response.data);
        throw new Error(
          `Server error (${axiosErr.response.status}): ${JSON.stringify(
            axiosErr.response.data
          )}`
        );
      } else if (axiosErr.request) {
        // no response from server
        console.error("❌ No response received:", axiosErr.request);
        throw new Error("No response received from server");
      } else {
        // something went wrong in setup
        console.error("❌ Request setup error:", axiosErr.message);
        throw new Error(axiosErr.message);
      }
    } else {
      // non-axios error
      console.error("❌ Unexpected Error:", error);
      throw new Error("An unexpected error occurred");
    }
  }
}

export async function fetchzipcodes() {
  try {
    const response = await axios.get(`${BASE}/api/test/zipcodes`, {
      params: { limit: 1000 },
      timeout: 10000,
    });
    console.log(
      "zipcodes fetched : ",
      response.data ? "fetched" : "fetch failed"
    );

    return response.data;
  } catch (error) {
    // ✅ 5. Handle different error types
    if (axios.isAxiosError(error)) {
      const axiosErr = error as AxiosError;

      if (axiosErr.response) {
        // server responded with error
        console.error("❌ Server Error:", axiosErr.response.data);
        throw new Error(
          `Server error (${axiosErr.response.status}): ${JSON.stringify(
            axiosErr.response.data
          )}`
        );
      } else if (axiosErr.request) {
        // no response from server
        console.error("❌ No response received:", axiosErr.request);
        throw new Error("No response received from server");
      } else {
        // something went wrong in setup
        console.error("❌ Request setup error:", axiosErr.message);
        throw new Error(axiosErr.message);
      }
    } else {
      // non-axios error
      console.error("❌ Unexpected Error:", error);
      throw new Error("An unexpected error occurred");
    }
  }
}

export const getServiceConversationDetails = async (
  serviceId: string,
  zipcode: string
) => {
  try {
    const response = await axios.get(
      `${BASE}/api/test/services/${serviceId}/get-details/conversation`,
      {
        params: {
          zipcode: zipcode,
        },
      }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("API error:", error.response?.data);
    } else {
      console.error("Unknown error:", error);
    }
    throw error;
  }
};
