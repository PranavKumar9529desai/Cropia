import { Link } from "@tanstack/react-router";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from "@repo/ui/components/card";
import { Button } from "@repo/ui/components/button";

export const SignUp = () => {
  return (
    <Card className="w-full max-w-sm border-none shadow-none">
      <CardHeader className="text-3xl font-bold text-primary space-y-2">
        <CardTitle>Invitation Required</CardTitle>
        <CardDescription>
          Admin accounts can only be created via an invitation link.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-muted-foreground">
        <p>
          Please check your email for an invitation from your organization.
          If you believe this is an error, contact your administrator.
        </p>
      </CardContent>
      <CardFooter>
        <Link to="/sign-in" className="w-full">
          <Button className="w-full">
            Go to Sign In
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};
