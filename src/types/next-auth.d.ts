import "next-auth"
import { DefaultSession } from "next-auth";
declare module "next-auth" {
    interface User {
        _id?: string;
        username?: string;
        isVerified?: boolean;
        isAcceptingMessage?: boolean;
    }
    interface Session {
        user: {
            _id?: string;
            username?: string;
            isVerified?: boolean;
            isAcceptingMessage?: boolean;
        } & DefaultSession['User']
    }
    interface JWT {
        _id?: string;
        username?: string;
        isVerified?: boolean;
        isAcceptingMessage?: boolean;
    }
    
}