import { Button } from "@repo/ui/components/button"
import { Card, CardContent, CardFooter, CardHeader } from "@repo/ui/components/card"
import { Input } from "@repo/ui/components/input"

export const SignUp = ({ pageheader }: { pageheader: string }) => {
    return <>
        <h1 className='text-3xl font-bold text-center'>{pageheader}</h1>
        <Card className='w-[400px] border-none shadow-none'>
            <CardHeader className="text-4xl font-bold">Sign up</CardHeader>
            <CardContent className='flex flex-col gap-3'>
                <div className='text-left '>
                    <span>Email</span>
                    <Input placeholder='Enter your Email' className='text-xs'></Input>
                </div>
                <div className='text-left'>
                    <span>Password</span>
                    <Input placeholder='Enter you Password'></Input>
                </div>
            </CardContent>
            <CardFooter>
                <Button className='border bg-primary w-full'>
                    Sign Up
                </Button>
            </CardFooter >
            <CardFooter className='hover:text-blue-400 cursor-pointer'> Forgot Password</CardFooter>
        </Card>

    </>
}