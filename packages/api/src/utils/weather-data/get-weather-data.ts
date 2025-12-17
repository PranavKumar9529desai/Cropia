import { OpenMeteoResponse } from "./weather-helpers";

export const getWeatherData = async (lat: number, lon: number) => {
  // 1. Construct Open-Meteo URL
  // We request past_days=3 for water balance history
  // We request specific agriculture variables
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    current:
      "temperature_2m,wind_speed_10m,rain,soil_moisture_3_9cm,soil_moisture_9_27cm,soil_temperature_0cm",
    hourly: "temperature_2m,precipitation_probability,wind_speed_10m",
    daily: "et0_fao_evapotranspiration,precipitation_sum",
    past_days: "3",
    forecast_days: "2",
    timezone: "auto",
  });

  const baseUrl =
    process.env.OPENMETEO_URL || "https://api.open-meteo.com/v1/forecast";
  const url = `${baseUrl}?${params.toString()}`;

  const response = await fetch(url);
  if (!response.ok) throw new Error("Weather API failed");

  return (await response.json()) as OpenMeteoResponse;
};
