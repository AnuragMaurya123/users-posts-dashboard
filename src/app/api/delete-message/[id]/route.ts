
import dbConnect from "@/lib/dbConnect";
import { getServerSession, User } from "next-auth";
import handleResponse from "@/app/helpers/handleResponse";
import  mongoose from "mongoose";
import Usermodel, { Message } from "@/model/User";
import authOptions from "../../auth/[...nextauth]/options";


export async function DELETE(request:Request, { params }: { params: { id: string } }){
    await dbConnect();
    const session=await getServerSession(authOptions)
  const sessionUser:User=session?.user
  //return error if session & user is not found
  if (!sessionUser || !sessionUser) {
    return handleResponse(401, {
      success: false,
      message: "Error in verifying user",
    });
  }

try {
    const user = await Usermodel.findOne({username: sessionUser.username})
    if (!user) {
        return handleResponse(401, {
            success: false,
            message: "User not found",
        });
    }

    const messageId = params.id;
    const deleteMessage = user.messages.filter(
(value: Message) => (value._id as mongoose.Types.ObjectId).toString() !== messageId
    );

    if (deleteMessage.length === user.messages.length) {
        return handleResponse(401, {
            success: false,
            message: "Message not found",
        });
    }
    
    // Update the messages array in the database
    user.messages = deleteMessage;
    await user.save();  // Save the updated user in MongoDB
    return handleResponse(201, {
        success: true,
        message: "Message deleted successfull",
        isAcceptingMessage:user.isAcceptingMessage,
        messages:user.messages
    });
} catch (error) {
    console.log("Error in deleting messages", error);
    return Response.json(
      {
        success: false,
        message: "Error in deleting messages",
      },
      {
        status: 500,
      }
    );
}

}