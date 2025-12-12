import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
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

const signUpFormSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(3, {
    message: "Password must be at least 3 characters.",
  }),
});

export type SignUpFormValues = z.infer<typeof signUpFormSchema>;

export interface SignUpFormProps {
  onSubmit: (values: SignUpFormValues) => Promise<void>;
  signInLink: ReactNode;
  googleButton?: ReactNode;
  isSubmitting?: boolean;
}

export const SignUpForm = ({
  onSubmit,
  signInLink,
  googleButton,
  isSubmitting,
}: SignUpFormProps) => {
  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpFormSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  const handleSubmit = async (values: SignUpFormValues) => {
    await onSubmit(values);
  };

  return (
    <Card className="w-full max-w-sm border-none shadow-none">
      <CardHeader className="text-3xl font-bold text-primary space-y-2">
        <CardTitle>Sign Up</CardTitle>
        <CardDescription>Create Account to Cropia.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="flex flex-col gap-3"
        >
          <CardContent className="space-y-4 text-primary/90">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your email" {...field} />
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
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter your password"
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
                ? "Creating Account..."
                : "Submit"}
            </Button>
          </CardFooter>
        </form>
      </Form>
      <CardFooter className="text-muted-foreground">
        Already have account? {signInLink}
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
