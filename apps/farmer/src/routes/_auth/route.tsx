import {
  createFileRoute,
  Outlet,
  redirect,
  useRouter,
} from "@tanstack/react-router";
import { NavBar } from "../../components/navbar/auth-navbar";
import { getuserLocationStatus } from "../../utils/user-location";
// import { authClient } from "../../lib/auth/auth-client";
import { SlideShow } from "@/components/auth-components/slide-show";
export const Route = createFileRoute("/_auth")({
  beforeLoad: async ({ context, location }) => {
    if (context.auth) {
      const isLocationFormSubmitted = await getuserLocationStatus();
      console.log("isLocationFormSubmitted", isLocationFormSubmitted);

      if (!isLocationFormSubmitted) {
        if (
          !location.pathname.includes("/location") &&
          !location.pathname.includes("/check-email") &&
          !location.pathname.includes("/verify-email")
        ) {
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
  const router = useRouter();
  return (
    <div className="w-full flex">
      <div className="md:w-2/5  w-full h-screen relative">
        <div className="absolute top-0 w-full">
          <NavBar
            title="Cropia"
            buttontext="Back"
            handleClick={() => router.history.back()}
          />
        </div>
        <div className="w-full justify-center flex items-center h-full  bg-background ">
          <Outlet />
        </div>
      </div>
      <div className="md:flex hidden w-3/5 h-screen bg-background">
        <SlideShow />
      </div>
    </div>
  );
}
