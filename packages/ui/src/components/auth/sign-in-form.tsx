import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { InputPassword } from "@repo/ui/components/input-password";
import type { ReactNode } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/components/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const signInFormSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(3, {
    message: "Password must be at least 3 characters.",
  }),
});

export type SignInFormValues = z.infer<typeof signInFormSchema>;

export interface SignInFormProps {
  onSubmit: (values: SignInFormValues) => Promise<void>;
  signUpLink: ReactNode;
  googleButton?: ReactNode;
  forgotPasswordLink?: ReactNode;
  isSubmitting?: boolean;
}

export const SignInForm = ({
  onSubmit,
  signUpLink,
  googleButton,
  forgotPasswordLink,
  isSubmitting,
}: SignInFormProps) => {
  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleSubmit = async (values: SignInFormValues) => {
    await onSubmit(values);
  };

  return (
    <Card className="w-full max-w-sm border-none shadow-none bg-transparent ">
      <CardHeader className="text-3xl font-bold text-primary space-y-2">
        <CardTitle>Sign In</CardTitle>
        <CardDescription>Sign in to start using Cropia.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="flex flex-col gap-3"
        >
          <CardContent className="space-y-4 text-primary/90">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your email"
                      autoComplete="username"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Password</FormLabel>
                    {forgotPasswordLink}
                  </div>
                  <FormControl>
                    <InputPassword
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="w-full">
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || form.formState.isSubmitting}
            >
              {isSubmitting || form.formState.isSubmitting
                ? "Signing in..."
                : "Submit"}
            </Button>
          </CardFooter>
        </form>
      </Form>
      <CardFooter className="text-muted-foreground">
        Account does not exist? {signUpLink}
      </CardFooter>
      {googleButton && (
        <CardFooter className="w-full text-center space-y-1 flex-col">
          <div className="flex items-center w-full my-4">
            <div className="flex-1 h-px bg-border"></div>
            <span className="px-3 text-sm text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-border"></div>
          </div>
          <div className="w-full">{googleButton}</div>
        </CardFooter>
      )}
    </Card>
  );
};
