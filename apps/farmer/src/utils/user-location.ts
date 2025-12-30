import { z } from "zod";
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
  district: string;
  state: string;
  taluka: string;
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
  const response = await apiClient.api.locations.talukas[":district_name"].$get(
    {
      param: { district_name: districtName },
    },
  );
  const result = await response.json();
  if (!result.success) {
    throw (result as any).error || "Failed to fetch talukas";
  }
  return result.data.talukas;
};

export const getVillages = async (
  state: string,
  district: string,
  taluka: string,
) => {
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

export const getLocationByPincode = async (pincode: string) => {
  const response = await apiClient.api.locations.pincode[":pincode"].$get({
    param: { pincode },
  });
  const result = await response.json();
  if (!result.success) {
    throw (result as any).error || "Failed to fetch location by pincode";
  }
  return result.data;
};

// ArcGIS Geocoding Implementation

export const reverseGeocode = async (lat: number, lng: number) => {
  const token = import.meta.env.VITE_ESRI_API_KEYS?.replace(/"/g, "") || "";
  if (!token) {
    console.error("ArcGIS API key not found");
    return null;
  }

  try {
    const url = `https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/reverseGeocode?f=json&location=${lng},${lat}&token=${token}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Failed to fetch reverse geocoding data");
    }

    const data = await response.json();
    if (data.error) {
      console.error("ArcGIS Error:", data.error);
      return null;
    }

    const address = data.address;
    if (!address) return null;

    return {
      state: address.Region || "",
      district: address.Subregion || "",
      pincode: address.Postal || "",
      address: address.Match_addr || address.LongLabel || "",
      city: address.City || "",
    };
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return null;
  }
};

export const forwardGeocode = async (query: string) => {
  const token = import.meta.env.VITE_ESRI_API_KEYS?.replace(/"/g, "") || "";
  if (!token) return null;

  try {
    const url = `https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?f=json&singleLine=${encodeURIComponent(
      query
    )}&maxLocations=1&token=${token}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.candidates && data.candidates.length > 0) {
      const candidate = data.candidates[0];
      return {
        lat: candidate.location.y,
        lng: candidate.location.x,
      };
    }
    return null;
  } catch (error) {
    console.error("Forward geocoding error:", error);
    return null;
  }
};

export const createLocationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().optional(),
  village: z.string().optional(),
  state: z.string().min(1, "State is required"),
  district: z.string().min(1, "District is required"),
  taluka: z.string().min(1, "Taluka is required"), // Added Taluka as mandatory
  pincode: z.string().min(1, "Pincode is required"),
  country: z.string(),
});

export type CreateLocationInputType = z.infer<typeof createLocationSchema>;
