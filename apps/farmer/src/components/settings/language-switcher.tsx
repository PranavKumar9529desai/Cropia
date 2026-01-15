import { useTranslation } from "react-i18next";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { Label } from "@repo/ui/components/label";

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  const handleLanguageChange = (value: string) => {
    i18n.changeLanguage(value);
    // Mark that the user has manually overridden the language
    // This prevents location-based auto-detection from overriding their choice
    localStorage.setItem("manual_language_override", "true");
  };

  return (
    <div className="flex flex-col gap-3">
      <Label htmlFor="language-select">{t("settings.language")}</Label>
      <Select value={i18n.language} onValueChange={handleLanguageChange}>
        <SelectTrigger id="language-select" className="w-full sm:w-[280px]">
          <SelectValue placeholder="Select Language" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="en">{t("languages.en")}</SelectItem>
          <SelectItem value="mr">{t("languages.mr")}</SelectItem>
          <SelectItem value="pa">{t("languages.pa")}</SelectItem>
        </SelectContent>
      </Select>
      <p className="text-sm text-muted-foreground">
        Select your preferred language for the application.
      </p>
    </div>
  );
}
