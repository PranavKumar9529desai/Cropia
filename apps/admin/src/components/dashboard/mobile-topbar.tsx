import { Link, useLocation } from "@tanstack/react-router";
import { Topbar } from "@repo/ui/components/topbar";
import { Button } from "@repo/ui/components/button";
import { Bell, Settings } from "lucide-react";

const getTitle = (pathname: string) => {
  if (pathname.includes("/home")) return "Home";
  if (pathname.includes("/scan")) return "Scan";
  if (pathname.includes("/assistant")) return "Assistant";
  return "Cropia";
};

export function MobileTopbar({
  isAdmin,
  jurisdiction,
}: {
  isAdmin: boolean;
  jurisdiction?: string;
}) {
  const { pathname } = useLocation();
  const title = getTitle(pathname);

  return (
    <Topbar
      className="border-b bg-background/80 backdrop-blur-md"
      leftContent={
        <div className="flex flex-wrap gap-y-[2px] gap-x-[2px]">
          {(title === "Cropia" || title === "Home") ? (
            <Link to="/dashboard" className="flex items-center gap-2">
              <img src="/favicon/favicon.svg" alt="Logo" className="size-8" />
              <div className="flex flex-col">
                <span className="font-brand font-bold text-lg leading-none tracking-tight">
                  Cropia
                </span>
                {isAdmin && (
                  <div className="flex items-center gap-1.5 mt-[2px]">
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
                      Admin
                    </span>
                    {jurisdiction && (
                      <>
                        <span className="h-0.5 w-0.5 rounded-full bg-muted-foreground" />
                        <span className="text-[10px] font-medium text-primary ">
                          {jurisdiction}
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </Link>
          ) : (
            <span className="font-brand font-bold text-2xl tracking-tight text-primary text-left">
              {title}
            </span>
          )}
        </div>

      }
      rightContent={
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
            <Link to="/dashboard/settings/notification">
              <Bell className="h-5 w-5" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
            <Link to="/dashboard/settings">
              <Settings className="h-5 w-5" />
            </Link>
          </Button>
        </ div>
      }
    />
  );
}
