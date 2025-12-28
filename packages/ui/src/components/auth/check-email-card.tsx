import { Mail, ArrowLeft } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Link } from "@tanstack/react-router";

interface CheckEmailCardProps {
  email?: string;
  onResend?: () => void;
  resendDisabled?: boolean;
  resendText?: string;
}

export function CheckEmailCard({
  email,
  onResend,
  resendDisabled,
  resendText,
}: CheckEmailCardProps) {
  return (
    <Card className="w-full max-w-sm mx-auto text-center bg-transparent sm:!bg-card border-none">
      <CardHeader>
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-primary/10 p-4">
            <Mail className="h-8 w-8 text-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl font-semibold">
          Check your email
        </CardTitle>
        <CardDescription className="text-base text-muted-foreground mt-2">
          We&apos;ve sent a verification link to{" "}
          <span className="font-medium text-foreground">
            {email || "your email"}
          </span>
        </CardDescription>
      </CardHeader>

      <CardFooter className="flex flex-col gap-4">
        <Button
          variant="default"
          className="w-full"
          onClick={onResend}
          disabled={resendDisabled}
        >
          {resendText || "Resend Email"}
        </Button>
        <Link
          to="/sign-in"
          className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Sign In
        </Link>
      </CardFooter>
    </Card>
  );
}
