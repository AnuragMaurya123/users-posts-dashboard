import dbConnect from "@/lib/dbConnect";
import handleResponse from "@/app/helpers/handleResponse";
import Usermodel from "@/model/User";
export const runtime = "nodejs";

export async function GET(request: Request) {
    await dbConnect();
 
    try {
        //getting users with messages
        const users = await Usermodel.aggregate([
            { $match: { messages: { $exists: true } } },
            { $unwind: { 
                path: "$messages", 
                preserveNullAndEmptyArrays: true 
            }},
            { $sort: { "messages.createdAt": -1 } },
            { $group: {
                _id: "$_id",
                username: { $first: "$username" },
                messages: { $push: "$messages" }
            }},
            { $project: {
                _id: 1,
                username: 1,
                messages: {
                    $slice: ["$messages", 10] // Limit to latest 10 messages
                }
            }}
        ])
        //returning error if no messages found
        if (!users) {
            return handleResponse(404, {
                success: false,
                message: "No messages found"
            })
        }
        //formatting the response
        const formattedResponse = {
            userMessages: users.map(user => ({
                username: user.username,
                messages: user.messages.length > 0 ? user.messages : []
            }))
        }
        //returning the response
        return Response.json(
            {
                success: true,
                message: "Messages Found",
                messages: formattedResponse ,
            },  
            {
                status: 200,
            }
          );
    } catch (error) {
        //logging the error
        console.error("Error in getting messages:", error);
        //returning the error
        return handleResponse(500, {
            success: false,
            message: "Error in getting messages"
        })
    }
}