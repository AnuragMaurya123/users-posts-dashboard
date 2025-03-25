import { z } from "zod";

export const signInSchema = z.object({
  username: z.string().min(2, { message: "Username is Required" }),
  password: z.string().min(8, { message: "Password is Required" }),
});
