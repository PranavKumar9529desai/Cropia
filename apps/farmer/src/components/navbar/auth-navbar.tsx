import { Button } from "@repo/ui/components/button";
import { Link } from "@tanstack/react-router";
import { ArrowBigLeft } from "lucide-react";

export const NavBar = ({
  title,
  buttontext,
  handleClick,
}: {
  title: string;
  buttontext: string;
  handleClick: () => void;
}) => {
  return (
    <>
      <div className="w-full flex justify-between items-center p-4 sm:px-6 sticky top-0 z-50 backdrop-blur-sm bg-background/80 transition-all duration-300">
        <Link className="flex items-center gap-3 group" to="/">
          <div className="relative overflow-hidden rounded-full">
            <img
              src="/favicon/favicon.ico"
              alt="Cropia Image"
              className="sm:w-10 sm:h-10 w-8 h-8 transition-transform duration-500 ease-out group-hover:rotate-12 group-hover:scale-110"
            />
          </div>
          <span className="text-primary font-bold sm:text-3xl text-xl font-brand transition-colors duration-300 group-hover:text-primary/80">
            {title}
          </span>
        </Link>
        <div>
          <Button
            variant={"ghost"}
            className="group flex items-center gap-2 hover:bg-primary/5 hover:text-primary transition-all duration-300 rounded-full px-4"
            onClick={handleClick}
          >
            <ArrowBigLeft className="w-5 h-5 transition-transform duration-300 ease-out group-hover:-translate-x-1" />
            <span className="font-medium text-base">{buttontext}</span>
          </Button>
        </div>
      </div>
    </>
  );
};
