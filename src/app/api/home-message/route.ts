import dbConnect from "@/lib/dbConnect";
import handleResponse from "@/app/helpers/handleResponse";
import Usermodel from "@/model/User";


export async function GET(request: Request) {
    await dbConnect();
 
    try {
        const users = await Usermodel.aggregate([
            { $match: { messages: { $exists: true, $ne: [] } } },
            { $unwind: { 
                path: "$messages", 
                preserveNullAndEmptyArrays: false 
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

        if (!users) {
            return handleResponse(404, {
                success: false,
                message: "No messages found"
            })
        }

        const formattedResponse = {
            userMessages: users.map(user => ({
                username: user.username,
                messages: user.messages
            }))
        }

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
        console.error("Error in getting messages:", error);
        return handleResponse(500, {
            success: false,
            message: "Error in getting messages"
        })
    }
}