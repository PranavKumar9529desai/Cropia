import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@repo/ui/components/card";

interface VerifyEmailCardProps {
  status: "idle" | "loading" | "success" | "error";
  message?: string;
  onVerify?: () => void;
  onGoToLogin: () => void;
  onContinue?: () => void;
}

export function VerifyEmailCard({
  status,
  message,
  onVerify,
  onGoToLogin,
  onContinue,
}: VerifyEmailCardProps) {
  return (
    <Card className="w-full max-w-md mx-auto text-center bg-transparent sm:!bg-card border-none sm:border-card">
      <CardHeader>
        <CardTitle>Email Verification</CardTitle>
        <CardDescription>
          {status === "idle" && "Click below to verify your email."}
          {status === "loading" && "Verifying your email address..."}
          {status === "success" && "Successfully verified!"}
          {status === "error" && "Verification failed."}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col items-center justify-center py-4 space-y-8">
        {status === "loading" && (
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        )}

        {status === "success" && (
          <div className="flex flex-col items-center space-y-2">
            <CheckCircle className="h-12 w-12 text-green-500" />
            <p className="text-sm text-muted-foreground">
              Your email has been verified. You can now access all features.
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center space-y-2">
            <XCircle className="h-12 w-12 text-destructive" />
            <p className="text-sm text-destructive font-medium">
              {message || "Invalid or expired token."}
            </p>
          </div>
        )}

        {/* Optional: Manual Trigger button if you don't want auto-verify */}
        {status === "idle" && onVerify && (
          <Button onClick={onVerify} size="lg">
            Verify Now
          </Button>
        )}
      </CardContent>

      <CardFooter className="flex justify-center">
        {status === "success" && (
          <Button onClick={onContinue || onGoToLogin} variant="default">
            Continue to App
          </Button>
        )}
        {status === "error" && (
          <Button onClick={onGoToLogin} variant="secondary">
            Back to Login
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
