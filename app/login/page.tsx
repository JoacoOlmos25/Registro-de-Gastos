"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { LogIn, Mail } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push("/");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        alert("¡Registro exitoso! Por favor verifica tu correo para confirmar tu cuenta.");
        setIsLogin(true);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Ocurrió un error en la autenticación.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Ocurrió un error con Google Auth.");
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-700 animate-in fade-in zoom-in-95 duration-300">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-100">
            Gestor de <span className="text-emerald-500">Gastos</span>
          </h1>
          <p className="text-slate-400 mt-2">
            {isLogin ? "Inicia sesión para continuar" : "Crea una cuenta para comenzar"}
          </p>
        </div>

        <button
          onClick={handleGoogleLogin}
          type="button"
          className="w-full bg-white text-slate-900 font-semibold py-3 px-4 rounded-lg transition-colors hover:bg-slate-200 flex items-center justify-center gap-3 mb-6"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.67 15.63 16.89 16.79 15.73 17.57V20.34H19.29C21.38 18.42 22.56 15.6 22.56 12.25Z" fill="#4285F4"/>
            <path d="M12 23C14.97 23 17.46 22.02 19.29 20.34L15.73 17.57C14.74 18.23 13.48 18.64 12 18.64C9.13 18.64 6.7 16.71 5.84 14.12H2.18V16.96C3.99 20.53 7.7 23 12 23Z" fill="#34A853"/>
            <path d="M5.84 14.12C5.62 13.46 5.49 12.75 5.49 12C5.49 11.25 5.62 10.54 5.84 9.88V7.04H2.18C1.43 8.53 1 10.21 1 12C1 13.79 1.43 15.47 2.18 16.96L5.84 14.12Z" fill="#FBBC05"/>
            <path d="M12 5.36C13.62 5.36 15.07 5.92 16.21 7L19.36 3.85C17.45 2.07 14.96 1 12 1C7.7 1 3.99 3.47 2.18 7.04L5.84 9.88C6.7 7.29 9.13 5.36 12 5.36Z" fill="#EA4335"/>
          </svg>
          Continuar con Google
        </button>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-slate-800 text-slate-400">o continuar con email</span>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 text-slate-500" size={20} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                placeholder="tu@email.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Contraseña</label>
            <div className="relative">
              <LogIn className="absolute left-3 top-2.5 text-slate-500" size={20} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md shadow-emerald-900/20 disabled:opacity-50"
          >
            {isLoading ? "Cargando..." : isLogin ? "Iniciar Sesión" : "Registrarse"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-400">
          {isLogin ? "¿No tienes cuenta? " : "¿Ya tienes cuenta? "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
          >
            {isLogin ? "Regístrate" : "Inicia Sesión"}
          </button>
        </div>
      </div>
    </main>
  );
}
