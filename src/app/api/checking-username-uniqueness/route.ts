import handleResponse from "@/app/helpers/handleResponse";
import dbConnect from "@/lib/dbConnect";
import Usermodel from "@/model/User";
import { usernameSchema } from "@/schemas/signupSchema";
import { z } from "zod";

//checking if the username is valid
const UsernameQuerySchema = z.object({
  username: usernameSchema,
});

export async function GET(request: Request) {
  await dbConnect();
  try {
    //getting the username from the url
    const { searchParams } = new URL(request.url);
    const queryParams = {
      username: searchParams.get("username"),
    };
    //checking if the username is valid
    const result = UsernameQuerySchema.safeParse(queryParams);

    //checking result is success & if not return error message
    if (!result.success) {
      const usernameError = result.error.format().username?._errors || [];

      return handleResponse(400, {
        success: false,
        message:
          usernameError?.length > 0
            ? usernameError.join(", ")
            : "Invalid username",
      });
    }
    //checking if the username is available & verifed
    const existingVerifiedUser = await Usermodel.findOne({
      username: result.data.username,
      isVerified: true,
    });
    //returning the response if the username is not available
    if (existingVerifiedUser) {
      return handleResponse(400, {
        success: false,
        message: "Username is not available",
      });
    }
    //returning the response if the username is available
    return handleResponse(201, {
      success: true,
      message: "Username is available",
    });
  } catch (error) {
    //logging the error
    console.log("Error in get user", error);
    //returning the error
    return Response.json(
      {
        success: false,
        message: "Error in check username availability",
      },
      {
        status: 500,
      }
    );
  }
}
