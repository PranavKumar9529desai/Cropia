/**
 * Types for the Open-Meteo Response structure we expect
 */
export interface OpenMeteoResponse {
  current: {
    time: string;
    temperature_2m: number;
    wind_speed_10m: number;
    rain: number;
    soil_moisture_3_9cm: number;
    soil_moisture_9_27cm: number;
    soil_temperature_0cm: number;
  };
  hourly: {
    time: string[];
    wind_speed_10m: number[];
    precipitation_probability: number[];
    temperature_2m: number[];
  };
  daily: {
    time: string[];
    et0_fao_evapotranspiration: number[];
    precipitation_sum: number[];
  };
}

/**
 * LOGIC 1: WATER BALANCE (The Tank)
 * Calculates the net water deficit over the last 3 days.
 * Formula: (Total Rain) - (Total Evapotranspiration)
 * * @param dailyData - The daily object from Open-Meteo
 * @returns Object with deficit value and actionable message
 */
export const calculateWaterBalance = (
  dailyData: OpenMeteoResponse["daily"],
) => {
  // With past_days=3, the array usually starts 3 days ago.
  // Indices: 0 (-3 days), 1 (-2 days), 2 (-1 day/Yesterday).
  // We exclude Index 3 (Today) because today isn't over yet.

  const pastDays = 3;
  let totalRain = 0;
  let totalEvaporation = 0;

  for (let i = 0; i < pastDays; i++) {
    totalRain += dailyData.precipitation_sum[i] || 0;
    totalEvaporation += dailyData.et0_fao_evapotranspiration[i] || 0;
  }

  const netBalance = totalRain - totalEvaporation;
  const isDeficit = netBalance < 0;

  let advice = "";
  let status: "CRITICAL" | "DEFICIT" | "SURPLUS" = "SURPLUS";

  if (netBalance < -10) {
    advice = "Critical deficit. Irrigation highly recommended.";
    status = "CRITICAL";
  } else if (netBalance < 0) {
    advice = "Slight deficit. Monitor crops.";
    status = "DEFICIT";
  } else {
    advice = "Soil is moisture positive. No irrigation needed.";
    status = "SURPLUS";
  }

  return {
    valueMm: Number(netBalance.toFixed(1)),
    status,
    advice,
  };
};

/**
 * LOGIC 2: SPRAY GUIDE (The Timeline)
 * Finds safe windows for spraying in the next 12 hours.
 * Safe = Wind < 15km/h AND Rain Prob < 30%
 */
export const analyzeSprayConditions = (
  hourly: OpenMeteoResponse["hourly"],
  currentISOTime: string,
) => {
  const currentHourIndex = hourly.time.findIndex((t) => t >= currentISOTime);

  if (currentHourIndex === -1)
    return { canSprayNow: false, nextWindow: "No data" };

  // Analyze next 12 hours
  const next12Hours = [];
  const limit = Math.min(currentHourIndex + 12, hourly.time.length);

  for (let i = currentHourIndex; i < limit; i++) {
    const wind = hourly.wind_speed_10m[i] ?? 0;
    const rainProb = hourly.precipitation_probability[i] ?? 0;
    const time = hourly.time[i];

    const isSafe = wind < 15 && rainProb < 30;

    next12Hours.push({
      time,
      isSafe,
      reason: isSafe
        ? "Good conditions"
        : wind >= 15
          ? "Too windy"
          : "Rain risk",
    });
  }

  // Determine immediate status
  const currentStatus = next12Hours[0];

  if (!currentStatus) {
    return {
      canSprayNow: false,
      currentWind: 0,
      reason: "No data",
      forecast: [],
    };
  }

  return {
    canSprayNow: currentStatus.isSafe,
    currentWind: hourly.wind_speed_10m[currentHourIndex] ?? 0,
    reason: currentStatus.reason,
    forecast: next12Hours, // Frontend can map this to the timeline bar
  };
};

/**
 * LOGIC 3: ROOT HEALTH (The X-Ray)
 * Compares Surface vs Deep moisture to detect "False Dryness"
 */
export const analyzeRootHealth = (
  surfaceMoisture: number,
  deepMoisture: number,
) => {
  // Moisture values are usually m³/m³. 0.10 is dry, 0.30 is wet (simplified for example).
  // Note: Open-Meteo returns m³/m³. We multiply by 100 for percentage if needed,
  // but let's assume raw values are passed and logic handles typical ranges.
  // Typlical Volumetric Water Content: Sand Saturation ~0.35, Clay ~0.50. Wilt point ~0.10.

  const SURFACE_DRY_THRESHOLD = 0.15; // 15%
  const DEEP_HEALTHY_THRESHOLD = 0.25; // 25%

  if (
    surfaceMoisture < SURFACE_DRY_THRESHOLD &&
    deepMoisture > DEEP_HEALTHY_THRESHOLD
  ) {
    return {
      status: "SAVER",
      title: "False Dryness",
      message: "Surface is dry, but roots have water. Delay irrigation.",
      color: "green",
    };
  }

  if (deepMoisture < 0.12) {
    return {
      status: "DANGER",
      title: "Deep Stress",
      message: "Root zone is critically dry. Deep irrigation needed.",
      color: "red",
    };
  }

  return {
    status: "OK",
    title: "Balanced",
    message: "Moisture levels are optimal.",
    color: "blue",
  };
};
