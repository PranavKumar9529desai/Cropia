import { Button } from "@repo/ui/components/button";

export interface GoogleButtonProps {
  title: string;
  onClick: () => void;
  isLoading?: boolean;
  iconSrc?: string;
}

export const GoogleButton = ({
  title,
  onClick,
  isLoading,
  iconSrc = "/google.png",
}: GoogleButtonProps) => {
  return (
    <Button
      variant="outline"
      className="w-full"
      onClick={onClick}
      disabled={isLoading}
    >
      <img src={iconSrc} alt="Google" className="size-6 p-1" />
      <span className="-ml-1">{isLoading ? "Signing in..." : title}</span>
    </Button>
  );
};
