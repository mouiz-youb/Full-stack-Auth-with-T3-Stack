import { z } from "zod";
import {db} from "@/server/db";
import {generateSalt, hashPassword, verifyPassword, generateSessionToken} from "@/lib/auth";
import { TRPCError } from "@trpc/server";
import { publicProcedure,createTRPCRouter  } from "../trpc";
import { cookies } from "next/headers";
import path from "path";

// signup procedure
export const AuthRouter =createTRPCRouter({
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
        ;(await cookies()).set({
            name:'sessoin_token',
            value:sessionToken,
            httpOnly:true,
            secure:process.env.NODE_ENV === 'production',
            maxAge:1000* 60 * 60 * 24 * 30, // 30 days
            path:'/',
            sameSite:'lax',
        })
          return {
            user:{id:user.id,email:user.email,name:user.name}
          }
    }),
    // login procedure
    login:publicProcedure
    .input(z.object({
        email:z.string().email(),
        password:z.string().min(8),
    }))
    .mutation(async({input})=>{
        const {email,password}=input
        // check if user exist
        const existingUser=await db.user.findUnique({
            where:{
                email
            }
        })  
        if(!existingUser){
            throw new TRPCError({
                code:"UNAUTHORIZED",
                message:"Invalid credentials"
            })
        }
        // check if password is correct 
        const isPasswordValid = verifyPassword(password,existingUser.salt,existingUser.password)
        if(!isPasswordValid){
            throw new TRPCError({
                code:"UNAUTHORIZED",
                message:"Invalid credentials"
            })
        }
        //Create session token 
        const sessionToken = generateSessionToken()
        // Set the session token in the database
        await db.session.create({
            data:{
                userId:existingUser.id,
                sessionToken,
                expiresAt:new Date(Date.now() + 1000 * 60 * 60 * 24 * 30) // 30 days
            }
        })
        // Set the cookie 
        ;(await cookies()).set({
            name:'session-token',
            value:sessionToken,
            httpOnly:true,
            secure:process.env.NODE_ENV === 'production',
            maxAge:1000 * 60 * 60 * 24 * 30, // 30 days
            path    :'/',
            sameSite:'lax',
        })
        return{
            user:{
                id :existingUser.id,
                email:existingUser.email
            }
        }
    }),
    // logout procedure 
    logout :publicProcedure
    .mutation(async({ctx})=>{
        // Get the session token from the cookie
        const sessionToken = (await cookies()).get('session-token')
        if(!sessionToken) return {seccess:true}
        // Delete the session from the database
        await db.session.deleteMany({
            where:{
                sessionToken:sessionToken.value
            }
        })
        // Clear the cookie 
        ;(await cookies()).delete('session-token')
        return{
            success:true
        }
    }),
    // get session procedure
    getSession :publicProcedure
    .query(async({ctx})=>{
        // Get the session token from the cookie
        const sessionToken = (await cookies()).get('session-token')
        if(!sessionToken) return {user:null}
        //⁡⁣⁣⁢ Get the session from the database⁡
        const session = await db.session.findUnique({
            where:{
                sessionToken:sessionToken.value
            },
            include:{
                user:true
            }
        })
        if(!session || new Date(session.expiresAt) <new Date()){
            (await cookies()).delete('session-token')
            return {user:null}
        }
        return{
            user:{
                id:session.user.id,
                email:session.user.email,
                name:session.user.name
            }
        }
    })
})




// if(!sessionToken){
//     throw new TRPCError({
//         code:'UNAUTHORIZED',
//         message:'Not logged in'
//     })
// }