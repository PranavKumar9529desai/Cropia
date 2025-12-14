import { Hono } from "hono";
import { auth } from "../auth";
import { prisma } from "@repo/db";
import {
  calculateWaterBalance,
  analyzeSprayConditions,
  analyzeRootHealth,
  type OpenMeteoResponse,
} from "../utils/weather-helpers";
import { getWeatherData } from "../utils/weather-data/get-weather-data";

const WeatherController = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
    userId: string;
  };
}>().get("/", async (c) => {
  const userId = c.get("userId");
  const name = c.get("user")?.name ?? "";

  if (!userId) {
    return c.json({ error: "User ID not found in context" }, 401);
  }

  try {
    const userLocation = await prisma.location.findUnique({
      where: { userId },
    });

    if (!userLocation) {
      return c.json({ error: "Location not found for this user" }, 404);
    }

    const { latitude: lat, longitude: lon } = userLocation;

    const data: OpenMeteoResponse = await getWeatherData(lat, lon);

    // 2. Process Insights (The Hook Logic)
    const waterBalance = calculateWaterBalance(data.daily);
    const sprayGuide = analyzeSprayConditions(data.hourly, data.current.time);
    const rootHealth = analyzeRootHealth(
      data.current.soil_moisture_3_9cm,
      data.current.soil_moisture_9_27cm,
    );

    // 3. Construct Clean JSON for Frontend
    return c.json({
      name,
      location: userLocation,
      current: {
        temp: data.current.temperature_2m,
        wind: data.current.wind_speed_10m,
        rain: data.current.rain,
        soil_temp:
          data.current.soil_temperature_0cm ?? data.current.temperature_2m, // fallback if 0cm not available in current, usually match
      },
      insights: {
        // Zone 1: Spray Guide
        spray_guide: sprayGuide,

        // Zone 2: Water Tank
        water_balance: waterBalance,

        // Zone 3: Root X-Ray
        root_health: {
          ...rootHealth,
          data: {
            surface_moisture: data.current.soil_moisture_3_9cm,
            deep_moisture: data.current.soil_moisture_9_27cm,
          },
        },
      },
    });
  } catch (error) {
    console.error(error);
    return c.json({ error: "Failed to fetch weather data" }, 500);
  }
});

export default WeatherController;
