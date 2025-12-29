import { District, INDIA_LOCATION_API_BASE } from "./location-helpers";

export async function fetchDistricts(state_name: string): Promise<District[]> {
    try {
        const response = await fetch(
            `${INDIA_LOCATION_API_BASE}/districts?state=${state_name}`,
        );
        if (!response.ok) throw new Error("Failed to fetch districts");
        const data = await response.json();
        return data.data.districts || [];
    } catch (error) {
        console.error("Error in fetchDistricts:", error);
        return [];
    }
}


console.log("fetchDistricts", await fetchDistricts("Maharashtra"));