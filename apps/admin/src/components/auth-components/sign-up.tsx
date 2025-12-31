import { Link } from "@tanstack/react-router";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@repo/ui/components/card";
import { Button } from "@repo/ui/components/button";

export const SignUp = () => {
  return (
    <Card className="w-full max-w-sm border-none shadow-none bg-transparent sm:border-card">
      <CardHeader className="borde-border text-destructive">
        <CardTitle className="text-2xl font-semibold">
          Invitation Required
        </CardTitle>
      </CardHeader>
      <CardContent className="text-muted-foreground text-sm">
        <p>
          Admin accounts are invite-only. Please check your email for an
          invitation from your organization.
        </p>
      </CardContent>
      <CardFooter>
        <Link to="/sign-in" className="w-full">
          <Button className="w-full">Go to Sign In</Button>
        </Link>
      </CardFooter>
    </Card>
  );
};
