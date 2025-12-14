import { apiClient } from "../lib/rpc";

/**
 * Checks if the user has submitted their location details.
 * @returns {Promise<boolean>} - true if location exists, false otherwise
 */
export const getuserLocationStatus = async (): Promise<boolean> => {
  try {
    const response = await apiClient.api.locations.$get();

    // Parse the JSON response
    const result = await response.json();

    // If the API returns success: true, location exists
    // If success: false (404), location doesn't exist
    const hasLocation = result.success === true;

    console.log("User location status:", hasLocation ? "Submitted" : "Not submitted");

    return hasLocation;
  } catch (error) {
    console.error("Error checking user location status:", error);
    // If there's an error, assume location is not submitted to be safe
    return false;
  }
};

interface LocationValues {
  latitude: number;
  longitude: number;
  address?: string;
  village?: string;
  city: string;
  district: string;
  state: string;
  taluka?: string;
  pincode: string;
  country: string;
}

export const postuserlocation = async (values: LocationValues) => {
  const response = await apiClient.api.locations.$post({
    json: values,
  });

  console.log("response from the  postUserLocation", response);
  return response;
};

export const getuserlocation = async () => {
  const reponse = await apiClient.api.locations.$get();
  const result = await reponse.json();
  if (!result.success) {
    throw result.error;
  } else {
    const data = result.data;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { user: _user, ...locationDetails } = data;
    return { ...locationDetails };
  }
};

export const getStates = async () => {
  const response = await apiClient.api.locations.states.$get();
  const result = await response.json();
  if (!result.success) {
    throw (result as any).error || "Failed to fetch states";
  }
  return result.data.states;
};

export const getDistricts = async (stateName: string) => {
  const response = await apiClient.api.locations.districts[":state_name"].$get({
    param: { state_name: stateName },
  });
  const result = await response.json();
  if (!result.success) {
    throw (result as any).error || "Failed to fetch districts";
  }
  return result.data.districts;
};

export const getTalukas = async (districtName: string) => {
  const response = await apiClient.api.locations.talukas[":district_name"].$get({
    param: { district_name: districtName },
  });
  const result = await response.json();
  if (!result.success) {
    throw (result as any).error || "Failed to fetch talukas";
  }
  return result.data.talukas;
};

export const getVillages = async (state: string, district: string, taluka: string) => {
  const response = await apiClient.api.locations.villages.$get({
    query: {
      state,
      district,
      taluka,
    },
  });
  const result = await response.json();
  if (!result.success) {
    throw (result as any).error || "Failed to fetch villages";
  }
  return result.data.villages;
};
