"use client"
import { User } from "next-auth"
import { signOut, useSession } from "next-auth/react"
import Link from "next/link"
import { Button } from "./ui/button"
import authOptions from "@/app/api/auth/[...nextauth]/options"


export default function Navbar() {
    const { data: session } = useSession()
    const user: User = session?.user
    return (
        <nav className="sticky top-0 z-50 bg-white p-4 md:p-6 shadow-md">
            <div className="container mx-auto flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
                <Link 
                    className="text-xl font-bold hover:text-gray-700 transition-colors" 
                    href="/"
                >
                    Mystery Message
                </Link>
                {session ? (
                    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 w-full sm:w-auto sm:ml-auto">
                        <span className="text-sm md:text-base text-gray-600">
                            Welcome, {user.username || user.email}
                        </span>
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                                                   <Button 
                                onClick={() => signOut()} 
                                variant="destructive"
                                className="whitespace-nowrap"
                            >
                                Sign Out
                            </Button>
                        </div>
                    </div>
                ) : (
                    <Link href="/sign-in" className="sm:ml-auto">
                        <Button variant="outline" className="w-full sm:w-auto">
                            Sign In
                        </Button>
                    </Link>
                )}
            </div>
        </nav>
    )
}
