"use client";

import RegisterForm from "@/components/auth/RegisterForm";
import LoginForm from "@/components/auth/LoginForm";
import InfoCard from "@/components/landingPage/InfoCard";
import { useState } from "react";

export default function Home() {

  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="flex flex-col gap-10">
      <div className="w-full p-10 flex flex-col items-center gap-6 bg-gradient-to-br from-space-dark via-space-teal to-space-dark">
        <div className="flex flex-col items-center text-center w-full md:mx-auto md:items-start text-space-light gap-4">
          <h1 className="text-3xl font-bold text-space-light">Lär dig investering utan risk med <span className="text-white">100 000 SEK</span> i demokapital</h1>
          <h2 className="text-space-light mb-4">Upplev spänningen i investeringsmarknaden utan att riskera riktiga pengar. Vår simulator ger dig realtidsdata och verktygen du behöver för att bli en expert.</h2>
        </div>
        <div className="w-full md:max-w-sm mx-auto bg-white p-4 border border-gray-300 rounded shadow">
          <div className="text-xl font-bold mb-4">
            <button className={`w-[50%] p-2 cursor-pointer ${isLogin ? 'border-b-2 border-space-dark text-space-dark' : 'border-b-2 border-gray-400 text-gray-400'}`} onClick={() => setIsLogin(true)}>
              Logga in
            </button>
            <button className={`w-[50%] p-2 cursor-pointer ${!isLogin ? 'border-b-2 border-space-dark text-space-dark' : 'border-b-2 border-gray-400 text-gray-400'}`} onClick={() => setIsLogin(false)}>
              Registrera
            </button>
          </div>
          {isLogin ? <LoginForm /> : <RegisterForm />}
        </div>
      </div>
      <InfoCard />
    </div>
  );
}
