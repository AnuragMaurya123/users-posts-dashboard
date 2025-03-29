import dbConnect from "@/lib/dbConnect";
import { getServerSession, User } from "next-auth";
import authOptions from "../auth/[...nextauth]/options";
import handleResponse from "@/app/helpers/handleResponse";
import Usermodel from "@/model/User";


export async function GET(request:Request){
    await dbConnect();
    //getting session for user
    const session=await getServerSession(authOptions)
  const user:User=session?.user
  //return error if session & user is not found
  if (!session || !user) {
    return handleResponse(401, {
      success: false,
      message: "Error in verifying user",
    });
  }  
const username = user.username
try {
  //getting user from database
  const user =await Usermodel.aggregate([
    {$match:{username}},
    {$unwind:{ path: "$messages", preserveNullAndEmptyArrays: true }},
    {$sort:{"messages.createdAt":-1}},
    {$group:{
      _id:"$_id",
      messages:{$push:"$messages"}
    }}
  ])
//returning error if user is not found
  if(!user || user.length===0){
    return handleResponse(401,{
      success:false,
      message:"User not Found"
    })
  }
  //returning user
  return handleResponse(201,{
    success:true,
    message:"User Found",
    messages:user[0].messages
  })
  
} catch (error) {
  //logging the error
  console.log("Error in getting messages", error);
  //returning the error
    return Response.json(
      {
        success: false,
        message: "Error in getting messages",
      },
      {
        status: 500,
      }
    );
}
}