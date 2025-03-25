import dbConnect from "@/lib/dbConnect";
import Usermodel from "@/model/User";
import { sendVericationEmail } from "@/app/helpers/sendVerificationEmail";
import bcrypt from "bcryptjs";
import handleResponse from "@/app/helpers/handleResponse";

export async function POST(request: Request) {

  await dbConnect();
  try {
    const { username, email, password } = await request.json();

    //checking if the request body is empty
    if (!username || !email || !password) {
      return handleResponse(400, {
        success: false,
        message: "All fields are required",
      });
    }
    //checking if the user already exists
    const exitingVerifiedUserByUsername = await Usermodel.findOne({
      username,
      isVerified: true,
    });
    //checking if the user already exists with username
    if (exitingVerifiedUserByUsername) {
      return handleResponse(400, {
        success: false,
        message: "Username already exists with this username",
      });
    }
    //getting the user by email
    const exitingUserByEmail = await Usermodel.findOne({ email });
    //creating verify code
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    //creating expiry date
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 1);
    //checking if the user already exists with email
    if (exitingUserByEmail) {
      //checking if the user is verified
      if (exitingUserByEmail.isVerified) {
        return handleResponse(400, {
          success: false,
          message: "Username already exists with this email",
        });
      }
      //Hashing the password
      const hasedPassword = await bcrypt.hash(password, 10);
      //updating the user
      await Usermodel.findOneAndUpdate(
        { email: email },
        {
          $set: {
            verifyCodeExpiry: expiryDate,
            verifyCode,
            password: hasedPassword,
          },
        },
        { new: true }
      );
    } else {
      //Hashing the password
      const hasedPassword = await bcrypt.hash(password, 10);
      //creating the user
      const newUser = new Usermodel({
        username,
        email,
        password: hasedPassword,
        verifyCode,
        verifyCodeExpiry: expiryDate,
        isVerified: false,
        isAcceptingMessage: true,
        messages: [],
      });
      //saving the user
      await newUser.save();
    }
    //sending verification email
    const emailResponse = await sendVericationEmail(
      email,
      username,
      verifyCode
    );

    //checking if the email is sent
    if (!emailResponse.success) {
     
      return handleResponse(400, {
        success: false,
        message: "Error in sending verifiaction email",
      });
    }

    return handleResponse(201, {
      success: true,
      message: "User registered successfully. Please verify your email." , 
    })
  } catch (error) {
    //logging the error
    console.log("Error in Registering user", error);
    //throwing the error
    return handleResponse(500, {
      success: false,
      message: "Error in Registering user",
    });
  }
}
