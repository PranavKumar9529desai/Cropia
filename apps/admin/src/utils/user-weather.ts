import { apiClient } from "../lib/rpc";

export const getUserWeather = async () => {
    const res = await apiClient.api.weather.$get();

    if (!res.ok) {
        throw new Error("Failed to fetch weather data");
    }

    const data = await res.json();
    return data;
};
