import { useMemo } from "react";
import { useAuth } from "../lib/auth/auth-context";

export type OfficerLevel = "state" | "district" | "taluka" | "village";

export function useJurisdiction() {
  const { session } = useAuth();

  const jurisdiction = useMemo(() => {
    // Better Auth stores additional fields directly on the session object if configured
    return (session as any)?.jurisdiction || null;
  }, [session]);

  const details = useMemo(() => {
    if (!jurisdiction) return null;

    const { state, district, taluka, village } = jurisdiction;

    let level: OfficerLevel = "state";
    let name = state;

    if (village && village !== "All" && village !== "*") {
      level = "village";
      name = village;
    } else if (taluka && taluka !== "All" && taluka !== "*") {
      level = "taluka";
      name = taluka;
    } else if (district && district !== "All" && district !== "*") {
      level = "district";
      name = district;
    }

    const labels: Record<OfficerLevel, string> = {
      state: "State Officer",
      district: "District Officer",
      taluka: "Taluka Officer",
      village: "Village Officer",
    };

    return {
      jurisdiction,
      level,
      name,
      label: labels[level],
      isStateLevel: level === "state",
      isDistrictLevel: level === "district",
      isTalukaLevel: level === "taluka",
      isVillageLevel: level === "village",
    };
  }, [jurisdiction]);

  return details;
}
