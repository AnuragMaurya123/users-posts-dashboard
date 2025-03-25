import { ApiResponse } from "@/types/apiResponse";

export default function handleResponse(status:number,response:ApiResponse) {
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
