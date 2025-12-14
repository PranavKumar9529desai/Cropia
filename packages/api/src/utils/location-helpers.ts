export const INDIA_LOCATION_API_BASE = "https://india-location-hub.in/api/locations";

export type State = {
    name: string;
    code: string;
};

export type District = {
    name: string;
    code: string;
    state_name: string;
};

export type Taluka = {
    name: string;
    code: string;
    district_name: string;
};

export type Village = {
    id: number;
    name: string;
    code: string;
    state_name: string;
    state_code: string;
    district_name: string;
    district_code: string;
    taluka_name: string;
    taluka_code: string;
};

export async function fetchStates(): Promise<State[]> {
    try {
        const response = await fetch(`${INDIA_LOCATION_API_BASE}/states`);
        if (!response.ok) throw new Error("Failed to fetch states");
        const data = await response.json();
        return data.data.states || [];
    } catch (error) {
        console.error("Error in fetchStates:", error);
        return [];
    }
}

export async function fetchDistricts(state_name: string): Promise<District[]> {
    try {
        const response = await fetch(`${INDIA_LOCATION_API_BASE}/districts?state=${state_name}`);
        if (!response.ok) throw new Error("Failed to fetch districts");
        const data = await response.json();
        return data.data.districts || [];
    } catch (error) {
        console.error("Error in fetchDistricts:", error);
        return [];
    }
}

export async function fetchTalukas(district_name: string): Promise<Taluka[]> {
    try {
        const response = await fetch(`${INDIA_LOCATION_API_BASE}/talukas?district=${district_name}`);
        if (!response.ok) throw new Error("Failed to fetch talukas");
        const data = await response.json();
        return data.data.talukas || [];
    } catch (error) {
        console.error("Error in fetchTalukas:", error);
        return [];
    }
}

export async function fetchVillages(state: string, district: string, taluka: string): Promise<Village[]> {
    try {
        const response = await fetch(
            `${INDIA_LOCATION_API_BASE}/villages?state=${encodeURIComponent(state)}&district=${encodeURIComponent(district)}&taluka=${encodeURIComponent(taluka)}`
        );
        if (!response.ok) throw new Error("Failed to fetch villages");
        const data = await response.json();
        return data.data.villages || [];
    } catch (error) {
        console.error("Error in fetchVillages:", error);
        return [];
    }
}
