"use client"
import { Button } from "@/components/ui/button"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import axios, { AxiosError } from "axios"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useEffect, useState } from "react"
import { useDebounceCallback } from 'usehooks-ts'
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { signUpSchema } from "@/schemas/signupSchema"
import { ApiResponse } from "@/types/apiResponse"
import { Loader2 } from "lucide-react"
import Link from "next/link"


export default function SignForm() {

  const [username, setUsername] = useState("")
  const [usernameMesssage, setUsernameMesssage] = useState("")
  const [isCheckingUsername, setIsCheckingUsername] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const debouncedUsername = useDebounceCallback(setUsername, 500)
  const { toast } = useToast()
  const router = useRouter()

  // 1. Define your form.
  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      username: username,
      password: ""
    },
  })

  useEffect(() => {
    const checkUsernameUniqueness = async () => {
      if (username) {
        setIsCheckingUsername(true)
        setUsernameMesssage("")
        try {
         const response= await axios.get(`/api/checking-username-uniqueness?username=${username}`)
         console.log(response);//todo :remove this line
         setUsernameMesssage(response?.data?.message)
        } catch (error) {
         const axiosError=error as AxiosError<ApiResponse>          
         setUsernameMesssage(
          axiosError.response?.data?.message || "Error in checking Username"
         )
        }finally{
          setIsCheckingUsername(false)
        }
      }
    }
    checkUsernameUniqueness()
  }, [username])

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof signUpSchema>) {
    setIsSubmitting(true)
    try {
      const response = await axios.post<ApiResponse>("/api/sign-up", values)
      toast({
        title:"success",
        description:response?.data?.message,
       })
      router.replace(`verify/${username}`)
    } catch (error) {
      console.log("Error in signup User",error);
      const axiosError=error as AxiosError<ApiResponse> 
      const errorMessage=axiosError.response?.data.message
      toast({
        title:"failed",
        description:errorMessage,
        variant:"destructive"
       })

    }finally{
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      
     <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md ">
      <div className="text-center ">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">Join Mystery Message</h1>
        <p className="mb-4">
          Sign up to start your anonymous adventure
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
                    onChange={(e) => {
                      field.onChange(e);
                      debouncedUsername(e.target.value);
                    }}
                  />
                </FormControl>
                <FormMessage />
                {isCheckingUsername ? (
                  <div className="text-sm text-gray-500"><Loader2 className="animate-spin"/></div>
                ) : (
                  <div className={`text-sm ${usernameMesssage.includes('not available') ? 'text-red-600' : 'text-green-600'}`}>
                    {usernameMesssage}
                  </div>
                )}
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
                  <Input placeholder="Enter your Email" {...field} />
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
                  <Input placeholder="Enter your password" {...field} />
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
              ):("Sign-up")
            }
          </Button>
        </form>
      </Form>
      <div className="text-center mt-4 ">
        <p>
          Already a member?{' '}
          <Link className="text-blue-600 hover:text-blue-800" href={"/sign-in"}>Sign in
          </Link>
        </p>
      </div>
     </div>
    </div>
  )
}


