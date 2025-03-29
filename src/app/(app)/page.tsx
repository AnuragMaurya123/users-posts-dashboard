"use client"
import { useToast } from "@/hooks/use-toast"
import { ApiResponse } from "@/types/apiResponse"
import { UserMessages } from "@/types/UserMessages"
import axios, { AxiosError } from "axios"
import { Copy } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
} from "@/components/ui/carousel"
import { Card, CardContent } from "@/components/ui/card"
import Autoplay from "embla-carousel-autoplay"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useSession } from "next-auth/react"
import { Message } from "@/model/User"

export default function Home() {
    const { toast } = useToast()
    const { data: session } = useSession()
    const [isLoading, setIsLoading] = useState(false)
    const [userMessages, setUserMessage] = useState<UserMessages[]>([])
    const copyToClipboard = (message: string) => {
        if (typeof window !== 'undefined') {
            navigator.clipboard.writeText(message)
            toast({
                title: "Message has been copied to clipboard",
            })
        }
    }

    // not showing the current user message
    const separatingUser = useCallback((messages: {
        username: string,
        messages: Message[]
    }[]) => {
        const array = messages.filter(message => message?.username !== session?.user.username)
        console.log(array);
        setUserMessage(array)
    }, [session?.user.username])

    // fetching the messages
    useEffect(() => {
        const fetchHomeMessage = async () => {
            setIsLoading(true)
            try {
                const response = await axios.get("/api/home-message")
                if (!response.data.success) return
                if (session?.user) {
                    separatingUser(response.data.messages.userMessages)
                    return
                }
                setUserMessage(response.data.messages.userMessages)
            } catch (error) {
                const axiosError = error as AxiosError<ApiResponse>
                const errorMessage = axiosError.response?.data.message
                toast({
                    title: "Failed",  // Capitalize first letter
                    description: errorMessage || "Failed to get messages",  // Capitalize first letter
                    variant: "destructive"
                })
            } finally {
                setIsLoading(false)
            }
        }
        fetchHomeMessage()
    }, [separatingUser, session?.user, toast])

    // function to get the relative time
    const getRelativeTime = (date: string) => {
        const now = new Date();
        const messageDate = new Date(date);
        const diffInSeconds = Math.floor((now.getTime() - messageDate.getTime()) / 1000);

        if (diffInSeconds < 60) return 'just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
        return messageDate.toLocaleDateString();
    };
    
    // if loading
    if (isLoading) {
        return (
            <main className="container mx-auto px-4 py-8">
                <section className="space-y-8">
                    <div className="grid gap-8">
                        {Array.from({ length: 3 }).map((_, index) => (
                            <div key={index} className="bg-white rounded-lg  p-6">
                                <h1 className="text-2xl font-bold mb-4 text-gray-800">
                                    <Skeleton className="h-4 w-[250px]" />
                                </h1>
                                <div className="relative">
                                    <Carousel
                                        opts={{
                                            align: "start",
                                        }}
                                        className="w-full"
                                    >
                                        <CarouselContent className="-ml-2 md:-ml-4">
                                            {Array.from({ length: 3 }).map((_, msgIndex) => (
                                                <CarouselItem
                                                    key={msgIndex}
                                                    className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3"
                                                >
                                                    <Card className="border flex border-gray-200 hover:shadow-lg transition-shadow h-[200px]">
                                                        <CardContent className="flex flex-col justify-between gap-4 p-6 w-full">
                                                            <div className="text-lg font-medium line-clamp-3">
                                                                <Skeleton className="h-4 w-[250px]" />
                                                            </div>
                                                            <span className="text-sm text-gray-500 flex items-center justify-between">
                                                                <span className="">  <Skeleton className="h-10 w-[40px]" /></span>
                                                                <Skeleton className="h-4 w-[250px]" />
                                                            </span>
                                                        </CardContent>
                                                    </Card>
                                                </CarouselItem>
                                            ))}
                                        </CarouselContent>
                                    </Carousel>
                                </div>
                            </div>
                        )
                        )}
                    </div>
                </section>
            </main>
        )
    }

    return (
        <main className="container mx-auto px-4 py-8">
            <section className="space-y-8">
                <div className="grid gap-8">
                    {userMessages.length > 0 ?
                        (
                            userMessages.map((userMessage, index) => {
                                const plugin = Autoplay({ delay: 2000, stopOnInteraction: true })
                                return (
                                    <div key={index} className="bg-white rounded-lg  p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h1 className="text-2xl font-bold mb-4 text-gray-800">
                                                Messages from {userMessage.username}
                                            </h1>
                                            <Link href={`/u/${userMessage.username}`}>
                                                <Button>Send message to {userMessage.username}</Button>
                                            </Link>
                                        </div>
                                        <div className="relative">
                                            <Carousel
                                                opts={{
                                                    align: "start",
                                                }}
                                                className="w-full"
                                                plugins={[plugin]}
                                            >
                                                <CarouselContent className="-ml-2 md:-ml-4">
                                                    {userMessage.messages.length > 0 ? (
                                                        userMessage.messages.map((message, msgIndex) => (
                                                            <CarouselItem
                                                                key={msgIndex}
                                                                className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3"
                                                            >
                                                                <Card className="border flex border-gray-200 hover:shadow-lg transition-shadow h-[200px]">
                                                                    <CardContent className="flex flex-col justify-between gap-4 p-6 w-full">
                                                                        <div className="text-lg font-medium line-clamp-3">
                                                                            {message.content}
                                                                        </div>
                                                                        <span className="text-sm text-gray-500 flex items-center justify-between">
                                                                            <span className="" onClick={() => copyToClipboard(message.content)}><Copy /></span>
                                                                            Received: {getRelativeTime(message.createdAt.toString())}
                                                                        </span>
                                                                    </CardContent>
                                                                </Card>
                                                            </CarouselItem>
                                                        ))
                                                    ) : (
                                                        <div className="ml-10">Send Message to display</div>
                                                    )}
                                                </CarouselContent>
                                            </Carousel>
                                        </div>
                                    </div>
                                )
                            })
                        ) : (
                            <div className="flex justify-center items-center min-h-screen">
                                <p className="">No Message Found</p>
                            </div>
                        )}

                </div>
            </section>
        </main>
    )
}
