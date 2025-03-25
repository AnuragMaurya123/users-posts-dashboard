"use client"
import { Button } from "@/components/ui/button"
import { signInSchema } from "@/schemas/signInSchema"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
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
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { signIn } from "next-auth/react"


export default function SignIn() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  // 1. Define your form.
  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      username: "",
      password: ""
    },
  })

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof signInSchema>) {
    setIsSubmitting(true)
    try {
      const result=await signIn("credentials",{
        redirect:false,
        email:values.username,
        password:values.password
      })

      if (result?.error) {
        if (result.error == "CredentialsSignIn") {
          toast({
            title:"Invalid credentials",
            variant: "destructive",
            description:result?.error
           })
        }
        toast({
          title:"Failed to Login",
          variant: "destructive",
          description:result?.error
         })
      }
      if(result?.url){
        router.replace(`/dashboard/u/${values.username}`)
      }
      
     
     
    } catch (error) {
      console.log("Error in signin User",error);
      toast({
        title:"failed",
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
          Sign in to start your anonymous adventure
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
                    placeholder="Enter your Email or Username" 
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
              ):("Sign-in")
            }
          </Button>
        </form>
      </Form>
      <div className="text-center mt-4 ">
        <p>
          Don&apos;t have a membership?{' '}
          <Link className="text-blue-600 hover:text-blue-800" href={"/sign-up"}>Sign up
          </Link>
        </p>
      </div>
     </div>
    </div>
  )
}
