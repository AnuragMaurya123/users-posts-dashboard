import type { Metadata } from "next";
import "@/app/globals.css"
import { Toaster } from "@/components/ui/toaster"
import Navbar from "@/components/Navbar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
   <>
   <Navbar />
    {children}
   </>
  );
}
