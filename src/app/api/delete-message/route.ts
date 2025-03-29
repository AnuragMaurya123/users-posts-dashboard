import dbConnect from "@/lib/dbConnect";
import { getServerSession, User } from "next-auth";
import handleResponse from "@/app/helpers/handleResponse";
import mongoose from "mongoose";
import Usermodel, { Message } from "@/model/User";
import authOptions from "../auth/[...nextauth]/options";

export async function DELETE(request: Request) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  const sessionUser: User = session?.user;

  if (!sessionUser) {
    return handleResponse(401, {
      success: false,
      message: "Error in verifying user",
    });
  }

  try {
    //getting the username from the url
    const { searchParams } = new URL(request.url);
    const queryParams = {
      _id: searchParams.get("_id"),
    };
    //finding the user from the database using the username from the url
    const user = await Usermodel.findOne({ username: sessionUser.username });
    //returning the response if the user is not found
    if (!user) {
      return handleResponse(401, {
        success: false,
        message: "User not found",
      });
    }
    //getting the message id from the url
    const messageId = queryParams._id;
    //deleting the message from the database
    const deleteMessage = user.messages.filter(
      (value: Message) =>
        (value._id as mongoose.Types.ObjectId).toString() !== messageId
    );
    //checking if the message is deleted
    if (deleteMessage.length === user.messages.length) {
      return handleResponse(404, {
        success: false,
        message: "Message not found",
      });
    }
    //updating the messages in the database
    user.messages = deleteMessage;
    //saving the user in the database
    await user.save();
    //returning the response
    return handleResponse(200, {
      success: true,
      message: "Message deleted successfully",
      isAcceptingMessage: user.isAcceptingMessage,
      messages: user.messages,
    });
  } catch (error) {
    //logging the error
    console.error("Error in deleting messages", error);
    //returning the error
    return handleResponse(500, {
      success: false,
      message: "Error in deleting messages",
    });
  }
}
