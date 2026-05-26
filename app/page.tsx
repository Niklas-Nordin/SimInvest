"use client";

import RegisterForm from "@/components/auth/RegisterForm";
import LoginForm from "@/components/auth/LoginForm";
import { useState } from "react";

export default function Home() {

  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="flex p-4">
      <div className="w-full max-w-sm mx-auto bg-white p-4 border border-gray-300 rounded shadow">
        <div className="text-xl font-bold mb-4">
          <button className={`w-[50%] p-2 cursor-pointer ${isLogin ? 'border-b-2 border-blue-500 text-blue-500' : 'border-b-2 border-gray-400 text-gray-400'}`} onClick={() => setIsLogin(true)}>
            Logga in
          </button>
          <button className={`w-[50%] p-2 cursor-pointer ${!isLogin ? 'border-b-2 border-blue-500 text-blue-500' : 'border-b-2 border-gray-400 text-gray-400'}`} onClick={() => setIsLogin(false)}>
            Registrera
          </button>
        </div>
        {isLogin ? <LoginForm /> : <RegisterForm />}
      </div>
    </div>
  );
}
