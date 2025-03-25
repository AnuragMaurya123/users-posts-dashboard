
import { resend } from "../../lib/resendEmail";
import VerificationEmail from "../../../emails/verificationEmailTemplate";
import { ApiResponse } from "@/types/apiResponse";

 export async function sendVericationEmail(email:string,username:string,verifyCode:string):Promise<ApiResponse> {
   try {
    // Send an email with the verification code
     await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: email,
        subject: `verification Email`,
        react:VerificationEmail({username,verifyCode}),
      });   
      
    return {success:true,message:"Verification message send successful"}  
   } catch (emailError) {
    console.log("Error sending verification message",emailError);
    return {success:false,message:"failed to send verification message"}
   }
  };