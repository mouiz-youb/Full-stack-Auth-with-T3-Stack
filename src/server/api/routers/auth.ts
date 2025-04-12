import { z } from "zod";
import {db} from "@/server/db";
import {generateSalt, hashPassword, verifyPassword, generateSessionToken} from "@/lib/auth";
import { TRPCError } from "@trpc/server";
import { publicProcedure,router  } from "../trpc";


// signup procedure
export const AuthRouter =router({
    signup: publicProcedure
    .input(z.object({
        email:z.string().email(),
        password:z.string().min(8),
        name:z.string().min(3),
    }))
    .mutation(async({input,ctx})=>{
        const {email,password ,name} =input 
        // check if user already exists
        const existingUser = await db.user.findUnique({
            where:{
                email
            }
        })
        if(existingUser){
            throw new TRPCError({
                code:"CONFLICT",
                message:"User already exists"
            })
        }
        // Create the user 
        const salt = generateSalt()
        const hashpassword = hashPassword(password,salt)
        const user = await db.user.create({
            data:{
                email,
                name,
                password:hashpassword,
                salt,
            }
        })
        // Create session token 
        const sessionToken = generateSessionToken()
        const session = await db.session.create({
            data:{
                userId:user.id,
                sessionToken,
                expiresAt:new Date(Date.now() +1000* 60 * 60 * 24 * 30) // 30 days

            }
        })
        // Set the cookie 
        
        ctx.res?.setHeader(
            'Set-Cookie',
            `session_token=${sessionToken}; Path=/; HttpOnly; SameSite=Lax; Secure=${process.env.NODE_ENV === 'production'}; Max-Age=${60 * 60 * 24 * 30}`
          );
          return {
            user:{id:user.id,email:user.email,name:user.name}
          }
    })
})