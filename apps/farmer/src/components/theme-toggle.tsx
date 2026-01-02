import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { useTheme } from "./theme-provider";
import { cn } from "@repo/ui/lib/utils";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  return (
    <>
      <div className="inline-flex items-center gap-2">
        <span>{theme}</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={cycleTheme}
          className="relative h-9 w-9 rounded-full bg-background/50 backdrop-blur-sm border border-border/40 hover:bg-accent/50 hover:border-border transition-all duration-300 group"
          title={`Current: ${theme} - Click to cycle`}
        >
          <div className="relative h-full w-full flex items-center justify-center">
            <Sun className={cn(
              "h-[1.2rem] w-[1.2rem] transition-all duration-300 absolute",
              theme === "light" ? "rotate-0 scale-100 opacity-100" : "rotate-90 scale-0 opacity-0"
            )} />
            <Moon className={cn(
              "h-[1.2rem] w-[1.2rem] transition-all duration-300 absolute",
              theme === "dark" ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
            )} />
            <Monitor className={cn(
              "h-[1.2rem] w-[1.2rem] transition-all duration-300 absolute",
              theme === "system" ? "scale-100 opacity-100" : "scale-50 opacity-0"
            )} />
          </div>
          <span className="sr-only">Toggle theme</span>
        </Button>
      </div>
    </>
  );
}
