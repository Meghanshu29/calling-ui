import AsyncStorage from "@react-native-async-storage/async-storage";

export const baseURL = "https://api.v2.production.smartmatrimony.ai/"; //production
//export const baseURL = "https://llm.api.smartmaheshwari.com/"; //staging

const getHost = async () => {
  const host = baseURL;
  return host;
};

export async function ApiRequest(
  method: string,
  endpoint: string,
  data: any = null,
  headers: any = null
) {
  try {
    const host = await getHost();
    const url = host + endpoint;

    // console.log('API Request URL:', url);
    // console.log('Method:', method);
    // console.log('Data:', data);

    // Get auth token and user info
    const authToken = await AsyncStorage.getItem("authToken");
    const userInfo = await AsyncStorage.getItem("userInfo");
    let userId = "";

    if (userInfo) {
      try {
        const parsedUser = JSON.parse(userInfo);
        userId = parsedUser.username || parsedUser.email || "";
      } catch (error) {
        console.error("Error parsing user info:", error);
      }
    } else if (authToken) {
      // Try to extract user ID from JWT token
      try {
        const payload = JSON.parse(atob(authToken.split(".")[1]));
        userId = payload.sub || payload.email || "";
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }

    //console.log("Retrieved token from storage:", authToken);
    //console.log("Using user ID:", userId);

    const isFormData = data instanceof FormData;
    const commonHeaders = isFormData
      ? {
          "X-User-Id": userId,
          Authorization: authToken ? `Bearer ${authToken}` : "",
        }
      : {
          "Content-Type": "application/json",
          "X-User-Id": userId,
          Authorization: authToken ? `Bearer ${authToken}` : "",
        };

    const finalHeaders = headers
      ? { ...headers, ...commonHeaders }
      : commonHeaders;
    //console.log("Request headers:", finalHeaders);

    const response = await fetch(url, {
      method,
      headers: finalHeaders,
      body: data && !isFormData ? JSON.stringify(data) : data,
    });

    //console.log("Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      //console.log("Error response:", errorText);

      // Only clear token on 401 if it's an auth-related endpoint
      if (response.status === 401 && (endpoint.includes('login') || endpoint.includes('auth'))) {
        await AsyncStorage.removeItem("authToken");
        await AsyncStorage.removeItem("userInfo");
      }

      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    //console.error("API Request Error:", error);
    throw error;
  }
}

export async function ApiRequestNoLoader(
  method: string,
  endpoint: string,
  data: any = null,
  headers: any = null
) {
  try {
    const host = await getHost();
    const url = host + endpoint;
    const authToken = await AsyncStorage.getItem("authToken");

    const commonHeaders = {
      "Content-Type": "application/json",
      Authorization: authToken ? `Bearer ${authToken}` : "",
    };

    const response = await fetch(url, {
      method,
      headers: headers ? { ...headers, ...commonHeaders } : commonHeaders,
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    throw error;
  }
}
