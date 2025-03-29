"use client"
import { useParams, useRouter } from "next/navigation"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { useToast } from "@/hooks/use-toast"
import { verifySchema } from "@/schemas/verifiedSchema"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import axios, { AxiosError } from "axios"
import { useState } from "react"
import { ApiResponse } from "@/types/apiResponse"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"


export default function VerifyingUser() {
    const searchParams = useParams<{ username: string }>()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const username = searchParams.username
    const { toast } = useToast()
    const router = useRouter()
    // 1. Define your form.
    const form = useForm<z.infer<typeof verifySchema>>({
        resolver: zodResolver(verifySchema),
        defaultValues: {
            username: username,
            verifyCode: ""
        },
    })

    // 2. Define a submit handler.
    async function onSubmit(values: z.infer<typeof verifySchema>) {
        setIsSubmitting(true)
        try {
            const response = await axios.post<ApiResponse>("/api/verify-code", values)
            toast({
                title: "success",
                description: response?.data?.message,
            })
            router.replace(`/sign-in`)
        } catch (error) {
            console.log("Error in signup User", error);
            const axiosError = error as AxiosError<ApiResponse>
            const errorMessage = axiosError.response?.data.message
            toast({
                title: "failed",
                description: errorMessage,
                variant: "destructive"
            })

        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div><div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md ">
                <div className="text-center ">
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6"> Verify Your Account</h1>
                    <p className="mb-4">
                       Enter your verification code send to your email
                    </p>
                </div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Username</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter your Username"
                                            {...field}
                                            readOnly
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="verifyCode"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Verification Code</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter your Code"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" disabled={isSubmitting}>
                            {
                                isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> please wait ...
                                    </>
                                ) : ("Verify")
                            }
                        </Button>
                    </form>
                </Form>


            </div>
        </div>
        </div>
    )
}
