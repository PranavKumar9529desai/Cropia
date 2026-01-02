"use client";

import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "./button";
import { cn } from "@repo/ui/lib/utils";

export function ModeToggle({ reverse = false }: { reverse?: boolean }) {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    // Avoid hydration mismatch
    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="inline-flex items-center gap-2">
                <div className="h-9 w-9 rounded-full bg-background/50 animate-pulse" />
                <div className="h-4 w-12 bg-background/50 animate-pulse rounded" />
            </div>
        );
    }

    const cycleTheme = () => {
        if (theme === "light") setTheme("dark");
        else if (theme === "dark") setTheme("system");
        else setTheme("light");
    };

    const IconGroup = (
        <div className="relative h-full w-full flex items-center justify-center font-brand">
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
    );

    const themeText = <span className="capitalize">{theme}</span>;

    const ThemeButton = (
        <Button
            variant="ghost"
            size="icon"
            onClick={cycleTheme}
            className="relative h-9 w-9 rounded-full bg-background/50 backdrop-blur-sm border border-border/40 hover:bg-accent/50 hover:border-border transition-all duration-300 group"
            title={`Current: ${theme} - Click to cycle`}
        >
            {IconGroup}
            <span className="sr-only">Toggle theme</span>
        </Button>
    );

    return (
        <div className="inline-flex items-center gap-2">
            {reverse ? (
                <>
                    {ThemeButton}
                    {themeText}
                </>
            ) : (
                <>
                    {themeText}
                    {ThemeButton}
                </>
            )}
        </div>
    );
}

export default ModeToggle;
