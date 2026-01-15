import { useEffect } from "react";
import { toast } from "sonner";
import { usePWAInstall } from "../hooks/use-pwa-install";
import { Button } from "./button";
import { X } from "lucide-react";
// @ts-expect-error logo import
import logo from "../assests/favicon.svg";

export const InstallPWA = () => {
  const { isInstallable, install } = usePWAInstall();

  useEffect(() => {
    if (isInstallable) {
      toast.custom(
        (t) => (
          <div className="relative flex w-full max-w-md items-center gap-4 rounded-xl border bg-background/95 p-4 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="size-16 shrink-0 overflow-hidden p-1">
              <img
                src={logo}
                alt="Cropia Logo"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="flex flex-1 flex-col gap-1 font-brand">
              <span className="font-semibold text-sm font-brand">
                Install Cropia
              </span>
              <span className="text-muted-foreground text-xs leading-tight ">
                Add to home screen for offline access and better performance.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                className="bg-primary hover:bg-primary/90 text-primary-foreground h-8 px-4 text-xs font-medium rounded-full shadow-sm"
                onClick={() => {
                  install();
                  toast.dismiss(t);
                }}
              >
                Install
              </Button>
              <Button
                // variant="destructive"
                onClick={() => toast.dismiss(t)}
                className="absolute -top-2 -right-2 inline-flex size-6 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-muted-foreground/20 transition-colors"
              >
                <X className="size-3" />
                <span className="sr-only">Close</span>
              </Button>
            </div>
          </div>
        ),
        {
          duration: Infinity,
          position: "top-center",
        },
      );
    }
  }, [isInstallable, install]);

  return null;
};
