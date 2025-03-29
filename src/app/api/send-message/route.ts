import dbConnect from "@/lib/dbConnect";
import Usermodel,{Message} from "@/model/User";
import handleResponse from "@/app/helpers/handleResponse";



export async function POST(request:Request){
    await dbConnect()
   try {
    //getting username & content from request body
    const {username,content}=await request.json();
    //validating username & content
    if (!content || !username) {
        return handleResponse(400,{
            success:false,
            message:"Please write something to send"
        })
    }
    //finding user
    const user=await Usermodel.findOne({username})
    //return error if user is not found
    if (!user) {
        return handleResponse(400,{
            success:false,
            message:"User Not Found"
        })
    }
    //checking if user is accepting message
    if(!user.isAcceptingMessage){
        return handleResponse(400,{
            success:false,
            message:"User Not Accepting Message"
        })
    }
    //creating new message
    const newMessage:Message={
        content,
        createdAt:new Date()
    }as Message

    //pushing message to user
    user.messages.push(newMessage)
    //saving user
    await user.save()
    //returning response
    return handleResponse(200,{
        success:true,
        message:"Message sended!",
    })

   } catch (error) {
    //logging error
    console.log("Error in sending messages", error);
    //returning error
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
