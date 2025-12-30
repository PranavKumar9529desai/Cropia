

export const INDIA_LOCATION_API_BASE = "https://india-location-hub.in/api/locations"

export async function fetchStates(): Promise<any[]> {
    try {
        const response = await fetch(`${INDIA_LOCATION_API_BASE}/states`);
        console.log("response from the location helpers", response)
        if (!response.ok) throw new Error("Failed to fetch states");
        const data = await response.json();
        return data.data.states || [];
    } catch (error) {
        console.error("Error in fetchStates:", error);
        return [];
    }
}

console.log("states are ", await fetchStates())


