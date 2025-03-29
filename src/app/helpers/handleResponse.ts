import { ApiResponse } from "@/types/apiResponse";

//custom function to handle response
export default function handleResponse(status:number,response:ApiResponse) {
    //returning response
    return Response.json(
        {
            success: response.success,
            message: response.message,
            isAcceptingMessage: response?.isAcceptingMessage ,
            messages: response?.messages ,
        },  
        {
            status: status,
        }
      );
}
