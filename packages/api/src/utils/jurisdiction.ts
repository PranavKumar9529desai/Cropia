import { Jurisdiction } from "@repo/db";

/**
 * Generates a Prisma 'where' filter based on the user's jurisdiction.
 * It identifies the officer's level and returns a filter that restricts
 * results to their specific area.
 */
export function getJurisdictionFilter(jurisdiction: Jurisdiction) {
  const where: any = {};
  const levels = ["state", "district", "taluka", "village"] as const;

  if (jurisdiction) {
    levels.forEach((level) => {
      const value = jurisdiction[level];
      // If it's specific (not "All" and not "*"), filter by it
      if (value && value !== "All" && value !== "*") {
        where[level] = { equals: value, mode: "insensitive" };
      }
    });
  }

  return where;
}

/**
 * Returns the specific jurisdiction metadata (level and name)
 */
export function getJurisdictionDetails(jurisdiction: Jurisdiction) {
  if (!jurisdiction) return null;

  const { state, district, taluka, village } = jurisdiction;

  if (village && village !== "All" && village !== "*") {
    return { level: "village", name: village, label: "Village Officer" };
  }
  if (taluka && taluka !== "All" && taluka !== "*") {
    return { level: "taluka", name: taluka, label: "Taluka Officer" };
  }
  if (district && district !== "All" && district !== "*") {
    return { level: "district", name: district, label: "District Officer" };
  }

  return { level: "state", name: state, label: "State Officer" };
}
