export type Jurisdiction = {
  state: string;
  district: string;
  taluka: string;
  village: string;
};

export const getJurisdictionDisplay = (
  jurisdiction?: Jurisdiction | Record<string, any> | null,
) => {
  if (!jurisdiction) return undefined;

  // Show the most specific level available
  if (jurisdiction.village && jurisdiction.village !== "All") {
    return jurisdiction.village;
  }
  if (jurisdiction.taluka && jurisdiction.taluka !== "All") {
    return jurisdiction.taluka;
  }
  if (jurisdiction.district && jurisdiction.district !== "All") {
    return jurisdiction.district;
  }
  if (jurisdiction.state && jurisdiction.state !== "All") {
    return jurisdiction.state;
  }
  return undefined;
};
