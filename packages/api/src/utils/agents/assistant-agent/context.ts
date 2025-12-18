// we must get data from the database for the scan result , weather data( specfic to the current location )

import prisma from "@repo/db";
import { getWeatherData } from "../../weather-data/get-weather-data";

export const getCropContext = async (userId: string) => {
  const location_data = await prisma.location.findUnique({ where: { userId } });

  if (!location_data) {
    return { msg: "No location data is their", data: null };
  }

  const { latitude: lat, longitude: lon, city, state, village } = location_data;

  const weather_data = await getWeatherData(lat, lon);

  if (!weather_data) {
    return { msg: "No Weather data is available", data: null };
  }

  const scan_details = await prisma.scan.findMany({ where: { userId } });

  const location_details = { city, state, village };
  const context = {
    location_details,
    weather_details: weather_data,
    scan_details,
  };
  console.log("the response from the getCropResponse is", context);
  return { msg: "success..", data: context };
};

export type CropContextResponseType = Awaited<
  ReturnType<typeof getCropContext>
>;
