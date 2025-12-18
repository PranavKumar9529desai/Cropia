import { FarmerContext } from "./types";

// Helper: Find the next 6 hours of data from the massive hourly arrays
const getForecastSummary = (weather: FarmerContext["weather_details"]) => {
  const now = new Date(weather.current.time);
  const currentHourStr = now.toISOString().slice(0, 13); // Matches "2025-12-06T21"

  // Find index where hourly time matches current hour
  const startIndex = weather.hourly.time.findIndex((t) =>
    t.startsWith(currentHourStr),
  );

  if (startIndex === -1) return "No forecast data available.";

  // Slice next 6 hours
  const next6HoursRain = weather.hourly.precipitation_probability.slice(
    startIndex,
    startIndex + 6,
  );
  const maxRainChance = Math.max(...next6HoursRain);

  return {
    summaryString: `Next 6 Hours: Max Rain Chance ${maxRainChance}%, Wind varies ${weather.hourly.wind_speed_10m[startIndex]} - ${weather.hourly.wind_speed_10m[startIndex + 5]} km/h`,
    maxRainChance, // Return number for logic check
  };
};

export const generateFarmerPrompt = (ctx: FarmerContext) => {
  const { current } = ctx.weather_details;
  const location = ctx.location_details;

  // 1. Calculate Logic (Deterministic Safety)
  const isWindUnsafe = current.wind_speed_10m > 15;
  const isRainUnsafe = current.rain > 0;
  const forecast = getForecastSummary(ctx.weather_details);

  // 2. Build the Safety Status Block
  let safetyStatus = "✅ GREEN CONDITION: Safe to spray.";
  if (isWindUnsafe) {
    safetyStatus = `❌ RED CONDITION: DO NOT SPRAY. Current wind (${current.wind_speed_10m} km/h) exceeds safety limit (15 km/h). Risk of drift.`;
  } else if (
    isRainUnsafe ||
    (typeof forecast !== "string" && forecast.maxRainChance > 40)
  ) {
    safetyStatus = `⚠️ ORANGE CONDITION: HIGH WASHOUT RISK. Rain is active or forecast > 40%. Spraying is wasteful.`;
  }

  // 3. Format Recent Scans
  const scanContext =
    ctx.scan_details.length > 0
      ? ctx.scan_details
          .map((scan) => {
            const dateStr = new Date(scan.createdAt).toLocaleDateString();
            return `- [${dateStr}] ${scan.crop}: ${scan.visualIssue || "No visual issue detected"} (Image: ${scan.imageUrl})`;
          })
          .join("\n")
      : "No recent crop issues detected.";

  // 4. Construct the Final Prompt
  return `
### ROLE
You are the Cropia Intelligence Unit. You assist a farmer in **${location.city}, ${location.state}**.

### 📊 REAL-TIME DATA (Source of Truth)
- **Time:** ${current.time}
- **Current Wind:** ${current.wind_speed_10m} km/h
- **Current Rain:** ${current.rain} mm
- **Soil Moisture:** ${current.soil_moisture_3_9cm} (0.0-0.5 scale)
- **Forecast:** ${typeof forecast === "string" ? forecast : forecast.summaryString}
- **Crop Context:** ${scanContext}

### 🛡️ DECISION MATRIX (You MUST follow this)
The system has pre-calculated the safety logic for you:
**${safetyStatus}**

### INSTRUCTIONS
1. **Safety First:** If the Decision Matrix says RED or ORANGE, you MUST start your response with that warning.
2. **Contextualize:** If the user asks "Can I spray?", cite the specific wind speed (${current.wind_speed_10m} km/h) as your evidence.
3. **Irrigation:** If Soil Moisture < 0.20, suggest irrigation. Currently it is ${current.soil_moisture_3_9cm}.
4. **Show Proof:** When discussing a specific crop scan, ALWAYS display its image using markdown syntax: \`![Crop Image](URL)\`. Do not just mention the image, actually render it.

### EXAMPLE RESPONSE
**User:** "Is it a good time to apply fungicide?"
**You:** "**${isWindUnsafe ? "No, do not spray." : "Yes, conditions are favorable."}**
${
  isWindUnsafe
    ? `The wind speed is currently **${current.wind_speed_10m} km/h**, which is too high. Waiting for it to drop below 15 km/h prevents chemical waste.`
    : "The wind is calm and no rain is expected for the next 6 hours."
}
`;
};
