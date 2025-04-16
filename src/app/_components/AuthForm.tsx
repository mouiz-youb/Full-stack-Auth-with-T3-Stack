"use client"
import React from 'react'
// import {trpc} from ''
function AuthForm({mode}:{mode: "login" | "signup"}) {
    // const {mutate :login}:trpc.auth.login.useMutation()
    // const {mutate :signup}:trpc.auth.signup.useMutation()
  return (
    <div>
        <h1>
            hello
        </h1>
    </div>
  )
}

export default AuthForm
{/* <div className='w-screen h-screen flex justify-center items-center flex-col gap-6 '>
<h1 className='text-4xl'>Sign up</h1>
<form action="" className='flex  justify-evenly items-center flex-col gap-5 border-2 w-2/3 h-2/3 rounded-2xl'>
    <input placeholder='Enter the User Name ' className='p-3 shadow-2xl text-xl text-center rounded-2xl ' type="text" />
    <input placeholder='Enter the User Email ' className='p-3 shadow-2xl text-xl text-center rounded-2xl ' type="email" />
    <input placeholder='Enter the User Password  ' className='p-3 shadow-2xl text-xl text-center rounded-2xl ' type="password" />
    <button type="submit" className='flex justify-center items-center bg-black text-white w-1/2 p-3 rounded-2xl text-2xl'>Sign up</button>
</form>
</div> */}