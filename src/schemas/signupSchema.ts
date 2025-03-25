import { z } from "zod";

export const usernameSchema = z
.string()
.min(2,"UserName should contain atleast two words")
.max(20 ,"UserName should not contain more than 20 words")
.regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores")
export const signUpSchema = z.object({
  username:usernameSchema,
  email: z
    .string()
    .regex(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "Please provide a valid email address"
    ),
  password:z.string()
  .min(8,{message:"Password should contain atleast eight words"})
  .max(20 ,"Password should not contain more than 20 words")
});
