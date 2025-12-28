import * as React from "react";
import { toast } from "@repo/ui/components/sonner";
import {
  getStates,
  getDistricts,
  getTalukas,
  getVillages,
} from "../utils/user-location";

interface UseLocationHierarchyProps {
  selectedState?: string;
  selectedDistrict?: string;
  selectedTaluka?: string;
}

export function useLocationHierarchy({
  selectedState,
  selectedDistrict,
  selectedTaluka,
}: UseLocationHierarchyProps) {
  const [states, setStates] = React.useState<any[]>([]);
  const [districts, setDistricts] = React.useState<any[]>([]);
  const [talukas, setTalukas] = React.useState<any[]>([]);
  const [villages, setVillages] = React.useState<any[]>([]);

  const [isLoadingStates, setIsLoadingStates] = React.useState(false);
  const [isLoadingDistricts, setIsLoadingDistricts] = React.useState(false);
  const [isLoadingTalukas, setIsLoadingTalukas] = React.useState(false);
  const [isLoadingVillages, setIsLoadingVillages] = React.useState(false);

  // Fetch States on Mount
  React.useEffect(() => {
    const fetchStatesData = async () => {
      setIsLoadingStates(true);
      try {
        const statesData = await getStates();
        setStates(statesData);
      } catch (error) {
        console.error("Error fetching states:", error);
        toast.error("Failed to load states");
      } finally {
        setIsLoadingStates(false);
      }
    };
    fetchStatesData();
  }, []);

  // Fetch Districts when State changes
  React.useEffect(() => {
    if (!selectedState) {
      setDistricts([]);
      return;
    }
    const fetchDistrictsData = async () => {
      const stateObj = states.find((s) => s.name === selectedState);
      if (!stateObj) return;

      setIsLoadingDistricts(true);
      try {
        const districtsData = await getDistricts(stateObj.name);
        setDistricts(districtsData);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load districts");
      } finally {
        setIsLoadingDistricts(false);
      }
    };
    fetchDistrictsData();
  }, [selectedState, states]);

  // Fetch Talukas when District changes
  React.useEffect(() => {
    if (!selectedDistrict) {
      setTalukas([]);
      return;
    }
    const fetchTalukasData = async () => {
      const districtObj = districts.find((d) => d.name === selectedDistrict);
      if (!districtObj) return;

      setIsLoadingTalukas(true);
      try {
        const talukasData = await getTalukas(districtObj.name);
        setTalukas(talukasData);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load talukas");
      } finally {
        setIsLoadingTalukas(false);
      }
    };
    fetchTalukasData();
  }, [selectedDistrict, districts]);

  // Fetch Villages when Taluka changes
  React.useEffect(() => {
    if (!selectedTaluka || !selectedDistrict || !selectedState) {
      setVillages([]);
      return;
    }
    const fetchVillagesData = async () => {
      setIsLoadingVillages(true);
      try {
        const villagesData = await getVillages(
          selectedState,
          selectedDistrict,
          selectedTaluka,
        );
        setVillages(villagesData);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load villages");
      } finally {
        setIsLoadingVillages(false);
      }
    };
    fetchVillagesData();
  }, [selectedTaluka, selectedDistrict, selectedState]);

  return {
    states,
    districts,
    talukas,
    villages,
    isLoadingStates,
    isLoadingDistricts,
    isLoadingTalukas,
    isLoadingVillages,
  };
}
