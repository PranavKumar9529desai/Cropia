// src/lib/ai/agents/farmer/types.ts

// 1. Weather Sub-Types
export interface WeatherUnits {
  time: string;
  interval: string;
  temperature_2m: string;
  wind_speed_10m: string;
  rain: string;
  soil_moisture_3_9cm: string;
}

export interface CurrentWeather {
  time: string;
  interval: number;
  temperature_2m: number;
  wind_speed_10m: number; // CRITICAL for safety logic
  rain: number; // CRITICAL for safety logic
  soil_moisture_3_9cm: number;
  soil_temperature_0cm: number;
}

export interface HourlyWeather {
  time: string[];
  temperature_2m: number[];
  precipitation_probability: number[];
  wind_speed_10m: number[];
}

export interface DailyWeather {
  time: string[];
  et0_fao_evapotranspiration: number[];
  precipitation_sum: number[];
}

export interface WeatherDetails {
  latitude: number;
  longitude: number;
  timezone: string;
  current_units: WeatherUnits;
  current: CurrentWeather;
  hourly: HourlyWeather;
  daily: DailyWeather;
}

// 2. Scan Sub-Types
export interface ScanDetail {
  id: string;
  createdAt: Date; // Changed from string to Date to match Prisma
  crop: string;
  visualIssue: string | null;
  diagnosis: string | null;
  confidence: number | null;
  imageUrl: string;
}

export interface LocationDetails {
  city: string;
  state: string;
  village: string | null;
}

// 3. THE MASTER CONTEXT
export interface FarmerContext {
  location_details: LocationDetails;
  weather_details: WeatherDetails;
  scan_details: ScanDetail[];
}
