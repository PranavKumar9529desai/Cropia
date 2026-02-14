import { OpenMeteoResponse } from "./weather-helpers";

// Simple in-memory cache implementation
class SimpleCache<T> {
  private cache = new Map<string, { value: T; expiry: number }>();
  private readonly ttl: number;
  private readonly maxSize: number;

  constructor(ttl: number, maxSize: number = 100) {
    this.ttl = ttl;
    this.maxSize = maxSize;
  }

  get(key: string): T | undefined {
    const item = this.cache.get(key);
    if (!item) return undefined;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return undefined;
    }

    // Refresh LRU (delete and re-add to end)
    // Note: This modifies the insertion order, keeping it "fresh"
    this.cache.delete(key);
    this.cache.set(key, item);

    return item.value;
  }

  set(key: string, value: T): void {
    // If cache is full and we are adding a new key
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      value,
      expiry: Date.now() + this.ttl,
    });
  }
}

// Cache TTL: 1 hour (3600 * 1000 ms)
const CACHE_TTL = 3600 * 1000;
const weatherCache = new SimpleCache<OpenMeteoResponse>(CACHE_TTL);

export const getWeatherData = async (lat: number, lon: number) => {
  const cacheKey = `${lat},${lon}`;

  // 1. Check Cache
  const cachedData = weatherCache.get(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  // 2. Construct Open-Meteo URL
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

  const data = (await response.json()) as OpenMeteoResponse;

  // 3. Store in Cache
  weatherCache.set(cacheKey, data);

  return data;
};
