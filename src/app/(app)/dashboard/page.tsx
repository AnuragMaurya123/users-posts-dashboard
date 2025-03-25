"use client"

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Message } from "@/model/User";
import { ApiResponse } from "@/types/apiResponse";
import axios, { AxiosError } from "axios";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { boolean, z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form"
import { acceptMessageSchema } from "@/schemas/acceptMessageSchema";
import { Separator } from "@/components/ui/separator";
import { Loader2, RefreshCcw } from "lucide-react";
import MessageCard from "@/components/MessageCard";



export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSwitchLoading, setIsSwitchLoading] = useState(false)
  const [isAcceptingMessage, setIsAcceptingMessage] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const { data: session } = useSession()
  const username = session?.user?.username
  const [profileUrl, setProfileUrl] = useState<string>('')
  const { toast } = useToast()
  
  const { register, setValue, watch } = useForm<z.infer<typeof acceptMessageSchema>>({
    resolver: zodResolver(acceptMessageSchema),
    defaultValues: {
      isAcceptingMessage
    },
  })

  useEffect(() => {
    if (typeof window !== 'undefined' && username) {
      const baseUrl = `${window.location.protocol}//${window.location.host}`
      setProfileUrl(`${baseUrl}/u/${username}`)
    }
  }, [username])

  const copyToClipboard = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(profileUrl)
      toast({
        title: "URL copied",
        description: "Profile URL has been copied to clipboard"
      })
    }
  }
  const accpetMessage = watch("isAcceptingMessage")

  const getMessageResponse = useCallback(async (refresh: boolean = false) => {
    setIsLoading(true)
    setIsSwitchLoading(true)
    try {
      const response = await axios.get<ApiResponse>("/api/get-message")
      setMessages(response?.data?.messages || [])
      if (refresh) {
        toast({
          title: "Success",
          description: "Showing Refresh Message"
        })
      }

    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      const errorMessage = axiosError.response?.data.message
      toast({
        title: "failed",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast, setIsSwitchLoading, setIsLoading])

  const fetchAccpetMessage = useCallback(async () => {
    setIsSwitchLoading(true)
    try {
      const response = await axios.get("/api/accept-message")
      setValue("isAcceptingMessage", response?.data?.isAcceptingMessage)
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      const errorMessage = axiosError.response?.data.message
      toast({
        title: "failed",
        description: errorMessage || "failed to fetch user setting",
        variant: "destructive"
      })
    } finally {
      setIsSwitchLoading(false)
    }
  }, [setValue, toast])

  useEffect(() => {
    if (!session || !session.user) return
    fetchAccpetMessage()
    getMessageResponse()
  }, [fetchAccpetMessage, getMessageResponse, session,setValue])


  const handleMessageDelete = (messageId: string) => {
    if (messages.length > 0) {
      setMessages(messages.filter((message: Message) => message._id !== messageId))
    }
  }

  const handleSwitchChange = async () => {
    setIsLoading(true)
    try {
      const response = await axios.post<ApiResponse>("/api/accept-message", {
        isAcceptingMessage: !accpetMessage
      })
      setIsAcceptingMessage(response.data.isAcceptingMessage || false)
      setValue("isAcceptingMessage", !accpetMessage)
      toast({
        title: response.data.message,
      })
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      const errorMessage = axiosError.response?.data.message
      toast({
        title: "failed",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!session || !session.user) {
    return <div className="">Please Login Again</div>
  }

  return (
    <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded-full w-full max-w-6xl">
      <h1 className="text-4xl font-bold mb-4">User Dashboard</h1>
      <div className="mb-4">
        <h1 className="text-lg font-semibold mb-2">Copy your unique link</h1>{" "}
        <div className="flex item-center">
          <input
            type="text"
            value={profileUrl}
            disabled
            className="input input-bordered w-full p-2 mr-2"
          />
          <Button onClick={copyToClipboard}>Copy</Button>
        </div>
      </div>
      <div className="mb-4">
        <Switch
          {...register("isAcceptingMessage")}
          checked={isAcceptingMessage}
          onCheckedChange={handleSwitchChange}
          disabled={isSwitchLoading}
        />
        <span className="ml-2">
          Accept Message:{isAcceptingMessage ? "On" : "Off"}
        </span>
      </div>
      <Separator />
      <Button className="mt-4" variant={"outline"} onClick={(e) => {
        e.preventDefault()
        fetchAccpetMessage()
        getMessageResponse(true)
      }}>
        {isLoading ? (
          <Loader2 className=" w-4 h-4 animate-spin"/>
        ) : (
          <RefreshCcw className="w-4 h-4" />
        )}
      </Button>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap6">
        {messages.length>0?(
          messages.map((message,index)=>(
            <MessageCard
            key={index}
            message={message}
            onMessageDelete={handleMessageDelete}
            />
          ))
        ):(
          <p className="">No Message to display</p>
        )}
      </div>
    </div>
  )
}
