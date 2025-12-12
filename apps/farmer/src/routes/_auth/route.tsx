import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { NavBar } from "../../components/navbar/auth-navbar";
import { getuserLocationStatus } from "../../utils/user-location";
import { authClient } from "../../lib/auth/auth-client";
import { HeroCarousel } from "@repo/ui/components/auth/slide-show";
export const Route = createFileRoute("/_auth")({
  beforeLoad: async ({ location }) => {
    const response = await authClient.getSession();
    const isLogged = response.data ? true : false;
    if (isLogged) {
      const isLocationFormSubmitted = await getuserLocationStatus();
      console.log("isLocationFormSubmitted", isLocationFormSubmitted);

      if (!isLocationFormSubmitted) {
        if (!location.pathname.includes("/location")) {
          // Try to preserve the authType context (sign-in or sign-up)
          const currentAuthType = location.pathname.includes("sign-up")
            ? "sign-up"
            : "sign-in";

          throw redirect({
            to: "/$authType/location",
            params: { authType: currentAuthType },
          });
        }
      } else {
        throw redirect({
          to: "/dashboard",
          search: {
            redirect: location.href,
          },
        });
      }
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="w-full flex">
      <div className="md:w-2/5  w-full h-screen">
        <div>
          <NavBar title="Cropia" buttontext="Back" />
        </div>
        <div className="w-full justify-center flex items-center h-full -mt-20">
          <Outlet />
        </div>
      </div>
      <div className="md:flex hidden w-3/5 h-screen">
        <HeroCarousel />
      </div>
    </div>
  );
}
