import dbConnect from "@/lib/dbConnect";
import { getServerSession, User } from "next-auth";
import handleResponse from "@/app/helpers/handleResponse";
import mongoose from "mongoose";
import Usermodel, { Message } from "@/model/User";
import authOptions from "../auth/[...nextauth]/options";

export async function DELETE(request:Request){
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
    const user = await Usermodel.findOne({ username: sessionUser.username });
    if (!user) {
      return handleResponse(401, {
        success: false,
        message: "User not found",
      });
    }

    const messageId = queryParams._id;
    const deleteMessage = user.messages.filter(
      (value: Message) =>
        (value._id as mongoose.Types.ObjectId).toString() !== messageId
    );

    if (deleteMessage.length === user.messages.length) {
      return handleResponse(404, {
        success: false,
        message: "Message not found",
      });
    }

    user.messages = deleteMessage;
    await user.save();

    return handleResponse(200, {
      success: true,
      message: "Message deleted successfully",
      isAcceptingMessage: user.isAcceptingMessage,
      messages: user.messages,
    });
  } catch (error) {
    console.error("Error in deleting messages", error);
    return handleResponse(500, {
      success: false,
      message: "Error in deleting messages",
    });
  }
}
