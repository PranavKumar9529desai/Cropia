import { Button } from "@repo/ui/components/button"
import { Link, useRouter } from "@tanstack/react-router"
import { ArrowBigLeft } from "lucide-react"

export const NavBar = ({ title, buttontext, handleClick }: { title: string, buttontext: string, handleClick: () => void }) => {

  return <>
    <div className="w-full flex justify-between p-4">
      <Link className="sm:size-10 size-8 flex h-10 items-center" to="/">
        <img src="/public/favicon/favicon.ico" alt="Cropia Image" sizes={"10"}>
        </img>
        <span className="ml-1 text-primary font-bold sm:text-3xl text-xl font-serif">{title}</span>
      </Link>
      <div>
        <Button variant={"outline"} className="border-none" onClick={handleClick}>
          <ArrowBigLeft />
          <span>{buttontext}</span>
        </Button>
      </div>
    </div>
  </>
}
