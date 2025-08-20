"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { FcGoogle } from "react-icons/fc";

export const Login = () => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);


  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMessage(null);

   const { error } = await supabase.auth.signInWithOAuth({
     provider: "google",
     options: {
       redirectTo: "https://pebfooprvahdefsjvjwi.supabase.co/auth/v1/callback",
     },
   });


    if (error) {
      setErrorMessage(`Ошибка входа: ${error.message}`);

      setLoading(false);
    }
  };

  return (
    <section className="flex flex-col items-center justify-center min-h-screen ">
      <div className="w-full max-w-sm p-6 bg-white rounded-xl shadow-md flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-6 text-black">
          Вход через Google
        </h1>

        {errorMessage && (
          <p className="mb-4 text-red-600 text-center">{errorMessage}</p>
        )}

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 px-4 text-black py-3 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FcGoogle size={24} />
          {loading ? "Загрузка..." : "Войти через Google"}
        </button>
      </div>
    </section>
  );
};
