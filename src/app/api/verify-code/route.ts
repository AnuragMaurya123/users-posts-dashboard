import handleResponse from "@/app/helpers/handleResponse";
import dbConnect from "@/lib/dbConnect";
import Usermodel from "@/model/User";


export async function POST(request: Request) {
  await dbConnect();
  try {
    //getting username & verifyCode from request body
    const { username, verifyCode } = await request.json();
    // Decode the username
    const decodedUsername = decodeURIComponent(username);

    // Find an unverified user by username or email
    const existingUnverifiedUser = await Usermodel.findOne({
      $or: [{ username: decodedUsername }, { email: decodedUsername }],
      isVerified: false, // Ensure the user is not already verified
    });

    if (!existingUnverifiedUser) {
      return handleResponse(400,{success:false,message:"User not found or already verified"})
    }

    // Validate verification code
    const isCodeValid = existingUnverifiedUser.verifyCode === verifyCode;
    const isCodeNotExpired =
      existingUnverifiedUser.verifyCodeExpiry > new Date();

    // If code is invalid
    if (!isCodeValid) {
        return handleResponse(400,{success:false,message:"Invalid verification code"})
      }
  
      // If the code is expired
      if (!isCodeNotExpired) {
        return handleResponse(400,{success:false,message:"Verification Code is expired, please signup again"})
      }
  
      // If both conditions are met, mark the user as verified
      const userVerified = await Usermodel.updateOne(
        { username: existingUnverifiedUser.username },
        { $set: { isVerified: true } }
      );
      // If verification fails
      if (!userVerified) {
        return handleResponse(400,{success:false,message:"Failed to verify user"})
      }
      // If verification is successful
      return handleResponse(200,{success:true,message:"User verified successfully"})
  } catch (error) {
    // Handle errors
    console.error("Error in verification", error);
    // Return an error response
    return handleResponse(500,{success:false,message:"Something went wrong in verification"})
  }
}
