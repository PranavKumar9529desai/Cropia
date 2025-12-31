import {
  createFileRoute,
  Outlet,
  redirect,
  useRouter,
} from "@tanstack/react-router";
import { NavBar } from "../../components/navbar/auth-navbar";
import { authClient } from "../../lib/auth/auth-client";
import { SlideShow } from "@/components/auth-components/slide-show";
export const Route = createFileRoute("/_auth")({
  beforeLoad: async () => {
    const response = await authClient.getSession();
    const isLogged = response.data ? true : false;
    if (isLogged) {
      throw redirect({
        to: "/dashboard",
        search: {
          redirect: location.href,
        },
      });
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
      <div className="sm:flex hidden w-3/5 h-screen bg-background">
        <SlideShow />
      </div>
    </div>
  );
}
