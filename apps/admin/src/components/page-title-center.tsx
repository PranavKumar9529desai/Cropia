import { cn } from "@repo/ui/lib/utils";

export const PageHeader = ({
  title,
  subtitle,
  className,
}: {
  title: string;
  subtitle: string;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center space-y-4 mt-16",
        className,
      )}
    >
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        <p className="text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
};
