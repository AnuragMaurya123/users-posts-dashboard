import dbConnect from "@/lib/dbConnect";
import { getServerSession, User } from "next-auth";
import authOptions from "../auth/[...nextauth]/options";
import handleResponse from "@/app/helpers/handleResponse";
import Usermodel from "@/model/User";

export async function GET(request: Request) {
    await dbConnect();

    // Getting session for user
    const session = await getServerSession(authOptions);
    const user: User = session?.user;

    // Return error if session & user are not found
    if (!session || !user) {
        return handleResponse(401, {
            success: false,
            message: "Error in verifying user",
        });
    }

    const username = user.username;

    try {
        // Getting user from database
        const dbUser = await Usermodel.aggregate([
            { $match: { username } },
            { 
                $unwind: { 
                    path: "$messages", 
                    preserveNullAndEmptyArrays: true 
                } 
            },
            { $sort: { "messages.createdAt": -1 } },
            { 
                $group: {
                    _id: "$_id",
                    messages: { $push: "$messages" }
                } 
            }
        ]);

        // If user is not found
        if (!dbUser || dbUser.length === 0) {
            return handleResponse(404, {
                success: false,
                message: "User not found",
                messages: []
            });
        }

        // If user exists but has no messages, return an empty array
        return handleResponse(200, {
            success: true,
            message: "User found",
            messages: dbUser[0].messages ?? []
        });

    } catch (error) {
        console.error("Error in getting messages:", error);
        return Response.json(
            {
                success: false,
                message: "Error in getting messages",
            },
            { status: 500 }
        );
    }
}
