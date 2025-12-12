import { Mail, ArrowLeft } from 'lucide-react';
import { Button } from '@repo/ui/components/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@repo/ui/components/card';
import { Link } from '@tanstack/react-router';

interface CheckEmailCardProps {
    email?: string;
    onResend?: () => void;
}

export function CheckEmailCard({ email, onResend }: CheckEmailCardProps) {
    return (
        <Card className="w-full max-w-md mx-auto text-center">
            <CardHeader>
                <div className="flex justify-center mb-4">
                    <div className="rounded-full bg-primary/10 p-4">
                        <Mail className="h-8 w-8 text-primary" />
                    </div>
                </div>
                <CardTitle className="text-2xl font-semibold">Check your email</CardTitle>
                <CardDescription className="text-base text-muted-foreground mt-2">
                    We&apos;ve sent a verification link to{' '}
                    <span className="font-medium text-foreground">{email || 'your email'}</span>
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                    Click the link in the email to verify your account and continue setting up your profile.
                </p>
                <p className="text-xs text-muted-foreground">
                    Didn&apos;t receive the email? Check your spam folder or try resending.
                </p>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
                <Button
                    variant="default"
                    className="w-full"
                    onClick={onResend}
                >
                    Resend Email
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
