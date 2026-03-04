"use client";

import React, { useState } from "react";
import {
    LogIn,
    UserPlus,
    Mail,
    Lock,
    Eye,
    EyeOff,
    Loader2,
    AlertCircle,
    ChevronRight
} from "lucide-react";
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile,
    signInWithPopup,
    GoogleAuthProvider
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface AuthFormProps {
    type: "login" | "register";
}

const AuthForm = ({ type }: AuthFormProps) => {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        username: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (type === "register") {
                const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
                if (formData.username) {
                    await updateProfile(userCredential.user, { displayName: formData.username });
                }
            } else {
                await signInWithEmailAndPassword(auth, formData.email, formData.password);
            }
            router.push("/dashboard");
        } catch (err: unknown) {
            console.error(err);
            if (err && typeof err === 'object' && 'code' in err) {
                const code = (err as { code: string }).code;
                setError(
                    code === "auth/user-not-found" || code === "auth/wrong-password"
                        ? "Credenciales incorrectas."
                        : code === "auth/email-already-in-use"
                            ? "Este email ya está en uso."
                            : "Error al autenticar. Revisa los datos."
                );
            } else {
                setError("Error desconocido al autenticar.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError(null);
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
            router.push("/dashboard");
        } catch (err: unknown) {
            console.error(err);
            setError("Error al iniciar con Google.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full space-y-8">
            {error && (
                <div className="p-4 bg-red-950/20 border border-red-500/30 rounded-xl text-red-200 text-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
                    <AlertCircle size={18} className="shrink-0" />
                    <p>{error}</p>
                </div>
            )}

            <form onSubmit={handleEmailAuth} className="space-y-4">
                {type === "register" && (
                    <div className="space-y-2">
                        <div className="relative group">
                            <input
                                name="username"
                                value={formData.username}
                                onChange={handleInputChange}
                                placeholder="Apodo (Opcional)"
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 flex px-4 text-sm text-white focus:outline-none focus:border-emerald-500/50 focus:bg-white/8 transition-all"
                            />
                        </div>
                    </div>
                )}

                <div className="space-y-2">
                    <div className="relative group">
                        <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-emerald-400 transition-colors" />
                        <input
                            required
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Email"
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-emerald-500/50 focus:bg-white/8 transition-all"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="relative group">
                        <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-emerald-400 transition-colors" />
                        <input
                            required
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            placeholder="Contraseña"
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-12 text-sm text-white focus:outline-none focus:border-emerald-500/50 focus:bg-white/8 transition-all"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
                        >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={cn(
                        "w-full py-4 rounded-xl flex items-center justify-center gap-2 font-black transition-all duration-300 transform active:scale-95",
                        loading
                            ? "bg-white/5 text-white/20"
                            : "bg-emerald-500 text-white shadow-xl hover:bg-emerald-400 button-glow"
                    )}
                >
                    {loading ? (
                        <Loader2 className="animate-spin" size={20} />
                    ) : (
                        <>
                            {type === "login" ? <LogIn size={20} /> : <UserPlus size={20} />}
                            {type === "login" ? "Iniciar Sesión" : "Crear Cuenta"}
                        </>
                    )}
                </button>
            </form>

            <div className="flex items-center gap-4">
                <div className="h-px bg-white/10 flex-1" />
                <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest px-2">o con Google</span>
                <div className="h-px bg-white/10 flex-1" />
            </div>

            <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full py-4 rounded-xl bg-white text-black font-black flex items-center justify-center gap-3 hover:bg-emerald-50 transition-all border border-white/10"
            >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                Continuar con Google
            </button>

            <div className="text-center">
                <button
                    onClick={() => router.push(type === "login" ? "/register" : "/login")}
                    className="text-xs text-white/40 hover:text-emerald-400 font-bold uppercase tracking-widest flex items-center gap-2 mx-auto"
                >
                    {type === "login" ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Entra"}
                    <ChevronRight size={14} />
                </button>
            </div>
        </div>
    );
};

export default AuthForm;
