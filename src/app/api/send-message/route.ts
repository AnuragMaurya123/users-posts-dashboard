import dbConnect from "@/lib/dbConnect";
import Usermodel,{Message} from "@/model/User";
import handleResponse from "@/app/helpers/handleResponse";



export async function POST(request:Request){
    await dbConnect()
   try {
    const {username,content}=await request.json();
    if (!content || !username) {
        return handleResponse(400,{
            success:false,
            message:"Please write something to send"
        })
    }
    const user=await Usermodel.findOne({username})
    if (!user) {
        return handleResponse(400,{
            success:false,
            message:"User Not Found"
        })
    }

    if(!user.isAcceptingMessage){
        return handleResponse(400,{
            success:false,
            message:"User Not Accepting Message"
        })
    }

    const newMessage:Message={
        content,
        createdAt:new Date()
    }as Message

    user.messages.push(newMessage)
    await user.save()
    return handleResponse(200,{
        success:true,
        message:"Message sended!",
    })

   } catch (error) {
    console.log("Error in sending messages", error);
    return Response.json(
      {
        success: false,
        message: "Error in sending messages",
      },
      {
        status: 500,
      }
    );
   }
}
