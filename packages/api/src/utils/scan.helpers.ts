import { prisma } from "@repo/db";
// If you are in a Turborepo, the types are usually exported from the DB package
// or generated client. If 'Scan' isn't found, you may need to import it from '@prisma/client'
// import type { Scan } from "@prisma/client";

// --- TYPE DEFINITIONS ---

// 1. GeoJSON Types (Standard Structure)
interface GeoJSONPoint {
  type: "Point";
  coordinates: number[]; // [Longitude, Latitude]
}

interface GeoJSONFeature {
  type: "Feature";
  properties: {
    id: string;
    crop: string;
    disease: string;
    status: "healthy" | "critical" | "warning";
    thumbnail: string;
    date: string;
    // Add simple location data for easy frontend access if needed
    locationText?: string;
  };
  geometry: GeoJSONPoint;
}

interface GeoJSONCollection {
  type: "FeatureCollection";
  features: GeoJSONFeature[];
}

// 2. Partial Scan Type (Matches your Prisma Model)
// We define a flexible interface to ensure this works even if specific Prisma types aren't generated yet.
interface ScanData {
  id: string;
  crop: string;
  visualIssue: string | null;
  imageUrl: string;
  createdAt: Date;
  latitude: number | null;
  longitude: number | null;
  location?: {
    coordinates: number[];
  } | null;
  village?: string | null;
  district?: string | null;
}

// --- HELPER FUNCTIONS ---

/**
 * 1. createLocationObject
 * Handles the "Hybrid Schema" logic.
 * Returns an object containing BOTH the simple floats (for Excel)
 * and the GeoJSON object (for Map Performance).
 */
export const createLocationObject = (latitude: number, longitude: number) => {
  return {
    // 1. Simple Fields (Easy for humans/Excel)
    latitude,
    longitude,

    // 2. Map Engine Field (Speed for queries)
    location: {
      type: "Point",
      // CRITICAL: MongoDB uses [Longitude, Latitude] order.
      coordinates: [longitude, latitude],
    },
  };
};

/**
 * 2. transformToGeoJSON
 * Converts raw DB records into the format MapLibre/Mapbox expects.
 * Handles the logic of deciding dot colors/status.
 */
export const transformToGeoJSON = (scans: ScanData[]): GeoJSONCollection => {
  return {
    type: "FeatureCollection",
    features: scans.map((scan) => {
      // Determine status for UI coloring (Red/Green/Yellow)
      const isHealthy = scan.visualIssue?.toLowerCase().includes("healthy");
      const status = isHealthy ? "healthy" : "critical";

      // Fallback: If map location object is missing, build it from lat/long
      const coordinates = scan.location?.coordinates || [
        scan.longitude || 0,
        scan.latitude || 0,
      ];

      return {
        type: "Feature",
        properties: {
          id: scan.id,
          crop: scan.crop,
          disease: scan.visualIssue || "Unknown",
          status: status,
          thumbnail: scan.imageUrl,
          date: scan.createdAt.toISOString(),
          locationText: scan.village || scan.district || "Unknown Location",
        },
        geometry: {
          type: "Point",
          coordinates: coordinates,
        },
      };
    }),
  };
};

/**
 * 3. generateScanSlug
 * Creates a readable, unique string for filenames or SEO-friendly URLs.
 * Example Output: "sugarcane-red_rot-lx1z9s"
 */
export const generateScanSlug = (crop: string, issue?: string | null) => {
  const cleanCrop = crop.toLowerCase().replace(/\s+/g, "_");
  const cleanIssue = issue
    ? issue.toLowerCase().replace(/\s+/g, "_")
    : "healthy";
  const timestamp = Date.now().toString(36); // Short, unique timestamp string

  return `${cleanCrop}-${cleanIssue}-${timestamp}`;
};

/**
 * 4. checkAlertThresholds
 * Checks if a specific disease has crossed the danger line in a village.
 * Uses the imported `prisma` client directly.
 */
export const checkAlertThresholds = async (scan: ScanData) => {
  // Guard clause: If we don't know the village or issue, we can't alert.
  if (!scan.village || !scan.visualIssue) {
    return { shouldAlert: false };
  }

  // 1. Count cases of THIS disease in THIS village in the last 24 hours
  const villageCount = await prisma.scan.count({
    where: {
      village: scan.village,
      visualIssue: scan.visualIssue,
      createdAt: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
      },
    },
  });

  const THRESHOLD = 10; // Simple logic: 10 cases = Outbreak

  if (villageCount >= THRESHOLD) {
    return {
      shouldAlert: true,
      level: "VILLAGE",
      recipientContext: `Farmers in ${scan.village}`,
      message: `OUTBREAK ALERT: ${villageCount} cases of ${scan.visualIssue} detected in ${scan.village} in the last 24 hours.`,
      data: {
        village: scan.village,
        disease: scan.visualIssue,
        count: villageCount,
      },
    };
  }

  return { shouldAlert: false };
};
