"use client"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "./ui/button"
import { Copy, Delete, Trash2, X } from "lucide-react";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/apiResponse";
import { Message } from "@/model/User";
import { useToast } from "@/hooks/use-toast";
type MessageCardProps = {
    message: Message;
    onMessageDelete: (messageId: string) => void
}


export default function MessageCard({ message, onMessageDelete }: MessageCardProps) {
    const { toast } = useToast()
    const handleDeleteMessage = async () => {
        try {
            const response = await axios.delete<ApiResponse>(`/api/delete-message?_id=${message._id}`)

            toast({
                title: "Success",
                variant: "destructive",
                description: response?.data.message
            })
            onMessageDelete(message._id as string)
        } catch (error) {
            console.log("Error in deleting message process", error);
            const axiosError = error as AxiosError<ApiResponse>
            const errorMessage = axiosError.response?.data.message
            toast({
                title: "failed",
                description: errorMessage,
                variant: "destructive"
            })
        }
    }
    const copyToClipboard = (message: string) => {
        if (typeof window !== 'undefined') {
            navigator.clipboard.writeText(message)
            toast({
                title: "Message has been copied to clipboard",
            })
        }
    }


    // Add this function at the top of the file after imports
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
    return (
        <div className="p-4">
            <Card className="w-full">
            <CardContent className="p-4 md:p-6">
                <div className="text-base md:text-lg font-medium line-clamp-3 mb-4">
                    {message.content}
                </div>
            </CardContent>
            <CardFooter className="p-4 md:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <Button 
                        variant="ghost" 
                        size="sm"
                        className="p-2 hover:bg-gray-100"
                        onClick={() => copyToClipboard(message.content)}
                    >
                        <Copy className="w-4 h-4" />
                    </Button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button 
                                variant="destructive" 
                                size="sm"
                                className="p-2"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="sm:max-w-[425px]">
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete your
                                    message and remove your data from our servers.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeleteMessage}>Continue</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
                <span className="text-sm text-gray-500">
                    Received: {getRelativeTime(message.createdAt.toString())}
                </span>
            </CardFooter>
        </Card>
        </div>
    )
}
