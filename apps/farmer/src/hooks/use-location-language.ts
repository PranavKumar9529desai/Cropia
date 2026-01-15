import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { getuserlocation } from "@/utils/user-location";

export const useLocationLanguage = () => {
  const { i18n } = useTranslation();

  useEffect(() => {
    const checkAndSetLocationLanguage = async () => {
      // 1. Check if user already has a preferred language in localStorage
      // We use a custom flag 'manual_language_override' to know if the user explicitly chose a language.
      const hasManualOverride = localStorage.getItem("manual_language_override");

      if (hasManualOverride) {
        return;
      }

      // If no manual override, we proceed to check location
      try {
        const locationData = await getuserlocation();
        if (!locationData || !locationData.state) return;

        const state = locationData.state.toLowerCase();
        let targetLang = "en";

        if (state.includes("maharashtra")) {
          targetLang = "mr";
        } else if (state.includes("punjab")) {
          targetLang = "pa";
        }

        if (targetLang !== "en" && targetLang !== i18n.language) {
            // Only change if we found a specific regional match
            // And save it so we don't query every time?
            // Actually, we should probably NOT save it to localStorage as a "user preference" automatically
            // to allow them to switch back to English if they want.
            // But `i18n.changeLanguage` will save it to localStorage because of our config.

            // To be safe and polite:
            // We change the language. The user can change it back in settings.
            i18n.changeLanguage(targetLang);
        }
      } catch (error) {
        console.error("Failed to detect location for language setting", error);
      }
    };

    checkAndSetLocationLanguage();
  }, [i18n]);
};
