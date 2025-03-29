import handleResponse from "@/app/helpers/handleResponse";
import dbConnect from "@/lib/dbConnect";
import { getServerSession, User } from "next-auth";
import authOptions from "../auth/[...nextauth]/options";
import Usermodel from "@/model/User";

export async function POST(request: Request) {
  //checking database connection
  await dbConnect();
  //checking if the user is logged in through next auth
  const session = await getServerSession(authOptions);
  const user: User = session?.user;
  //return error if session & user is not found
  if (!session || !user) {
    return handleResponse(401, {
      success: false,
      message: "Error in verifying user",
    });
  }
  const userId = user._id;

  try {
    //getting the request body
    const { isAcceptingMessage } = await request.json();
    //checking if the user exists than update the status
    const updateUserStatus = await Usermodel.findByIdAndUpdate(
      { _id: userId },
      { $set: { isAcceptingMessage } },
      { new: true }
    );
    //returning the response if the user is not found
    if (!updateUserStatus) {
      return handleResponse(400, {
        success: false,
        message: "Error in updating user status",
      });
    }
    //returning the response if the user is found
    return handleResponse(200, {
      success: true,
      message: "User status updated successfully",
      isAcceptingMessage: updateUserStatus.isAcceptingMessage,
    });
  } catch (error) {
    //logging the error
    console.log("Error in messages accpeting", error);
    //throwing the error
    return handleResponse(500, {
      success: false,
      message: "Error in messages accpeting",
    });
  }
}

export async function GET(request: Request) {
  //checking database connection
  await dbConnect();
  //checking if the user is logged in through next auth
  const session = await getServerSession(authOptions);

  const user: User = session?.user;
  //return error if session & user is not found
  if (!session || !user) {
    return handleResponse(401, {
      success: false,
      message: "Error in verifying user",
    });
  }
  const userId = user._id;

  try {
    //checking if the user exists
    const exitingUser = await Usermodel.findById({ _id: userId });
    if (!exitingUser) {
      return handleResponse(400, {
        success: false,
        message: "Error in getting user status",
      });
    }
    //returning the user status
    return handleResponse(200, {
      success: true,
      message: "User status fetched successfully",
      isAcceptingMessage: exitingUser.isAcceptingMessage,
    });
  } catch (error) {
    //logging the error
    console.log("Error in getting user status", error);
    return handleResponse(500, {
      success: false,
      message: "Error in getting user status",
    });
  }
}
