import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, User, AlertCircle, Loader2 } from "lucide-react";
import { t, getLanguage, setLanguage } from "../lib/translations";

export function WelcomeScreen() {
  const { signUpWithEmail, signInWithEmail, signInWithGoogle } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const lang = getLanguage();
  const isRtl = lang === "ar";
  const textDir = isRtl ? "text-right" : "text-left";

  const translateError = (errCode: string): string => {
    if (lang === "en") {
      switch (errCode) {
        case "auth/invalid-email": return "The entered email address is invalid.";
        case "auth/user-disabled": return "This user account has been disabled.";
        case "auth/user-not-found": return "No account found with this email.";
        case "auth/wrong-password": return "Incorrect password.";
        case "auth/email-already-in-use": return "Email is already in use by another account.";
        case "auth/weak-password": return "Password is too weak - must be at least 6 characters.";
        case "auth/popup-closed-by-user": return "Login window was closed before completion.";
        case "auth/operation-not-allowed": return "Email/Password provider is not enabled in your Firebase console. Please enable it under Firebase Auth Providers, or use 'Sign In with Google' for instant access.";
        case "auth/configuration-not-found": return "Please make sure this sign-in method is enabled in your Firebase console.";
        default: return "An unexpected error occurred. Please try again later.";
      }
    }
    switch (errCode) {
      case "auth/invalid-email": return "البريد الإلكتروني المدخل غير صالح.";
      case "auth/user-disabled": return "هذا الحساب تم تعطيله.";
      case "auth/user-not-found": return "لم يتم العثور على حساب بهذا البريد الإلكتروني.";
      case "auth/wrong-password": return "كلمة المرور غير صحيحة.";
      case "auth/email-already-in-use": return "البريد الإلكتروني مستخدم بالفعل بحساب آخر.";
      case "auth/weak-password": return "كلمة المرور ضعيفة للغاية - يجب أن تكون 6 خانات على الأقل.";
      case "auth/popup-closed-by-user": return "تم إغلاق نافذة تسجيل الدخول من قبل المستخدم.";
      case "auth/operation-not-allowed": return "طريقة تسجيل الدخول بالبريد الإلكتروني غير مفعّلة في مشروع Firebase الخاص بك حالياً. لتفعيلها، يرجى تمكين 'Email/Password' في لوحة تحكم Firebase Auth، أو استخدام 'تسجيل الدخول بواسطة Google' كبديل مباشر وسهل.";
      case "auth/configuration-not-found": return "يرجى التأكد من تفعيل طريقة تسجيل الدخول هذه في لوحة تحكم Firebase.";
      default: return "حدث خطأ غير متوقع. يرجى المحاولة لاحقاً.";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!email || !password || (isSignUp && !name)) {
      setError(t("auth_error_fields"));
      return;
    }
    if (password.length < 6) {
      setError(t("auth_error_weak_pass"));
      return;
    }
    setLoading(true);
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password, name);
        setSuccessMsg(isRtl ? "تم إنشاء الحساب بنجاح! تم تسجيل دخولك." : "Account created successfully! You are now logged in.");
      } else {
        await signInWithEmail(email, password);
      }
    } catch (err: any) {
      console.error(err);
      setError(translateError(err.code || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error(err);
      setError(translateError(err.code || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] p-4 w-full" dir={isRtl ? "rtl" : "ltr"}>
      {/* Container */}
      <div className="w-full max-w-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[2rem] shadow-xl p-8 text-[#1a2332] dark:text-white transition-colors">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-brand-primary items-center justify-center text-white font-black text-2xl mb-4 shadow-lg shadow-brand-primary/20">
            S
          </div>
          <h1 className="text-2xl font-black text-[#1a2332] dark:text-white mb-1">
            {t("app_title")}
          </h1>
          <p className="text-sm font-semibold text-[#6b7280] dark:text-slate-300">
            {isRtl ? "مرحباً بك في الميزانية الذكية" : "Welcome to Smart Budget"}
          </p>
          <p className="text-xs text-brand-helper dark:text-slate-400 mt-2 px-2 leading-relaxed">
            {isSignUp ? t("auth_desc_signup") : t("auth_desc_signin")}
          </p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-5 p-3.5 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
            <span className="text-xs font-semibold text-red-700 dark:text-red-400 leading-relaxed">{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="mb-5 p-3.5 bg-brand-success/10 border border-brand-success/30 rounded-xl flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-brand-success mt-0.5 shrink-0" />
            <span className="text-xs font-semibold text-brand-success leading-relaxed">{successMsg}</span>
          </div>
        )}

        <div className="flex flex-col gap-4 mb-6">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-[#1a2332] dark:text-white hover:bg-slate-50 dark:hover:bg-slate-600 font-bold text-sm flex items-center justify-center gap-2.5 transition duration-200 shadow-md cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#1a2332] dark:text-white" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            )}
            <span>{t("auth_btn_google")}</span>
          </button>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 border-t border-slate-200 dark:border-slate-700"></div>
          <span className="px-1 text-xs font-bold text-brand-helper dark:text-slate-400">{t("auth_divider")}</span>
          <div className="flex-1 border-t border-slate-200 dark:border-slate-700"></div>
        </div>

        {/* Email Password Form */}
        <form onSubmit={handleSubmit} className={`space-y-4 ${textDir}`}>
          {isSignUp && (
            <div className="space-y-1.5">
              <label className="text-xs text-[#1a2332] dark:text-slate-300 font-semibold">{t("auth_label_name")}</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder={isRtl ? "محمد أحمد" : "John Doe"}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  className={`w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl py-3 text-sm text-[#1a2332] dark:text-white placeholder-[#6b7280] dark:placeholder-slate-400 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition ${isRtl ? "pl-4 pr-11" : "pr-4 pl-11"}`}
                />
                <User className={`absolute top-3.5 w-4 h-4 text-slate-400 dark:text-slate-400 ${isRtl ? "right-4" : "left-4"}`} />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs text-[#1a2332] dark:text-slate-300 font-semibold">{t("auth_label_email")}</label>
            <div className="relative">
              <input
                type="email"
                placeholder="example@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className={`w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl py-3 text-sm text-[#1a2332] dark:text-white placeholder-[#6b7280] dark:placeholder-slate-400 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition ${isRtl ? "pl-4 pr-11" : "pr-4 pl-11"}`}
              />
              <Mail className={`absolute top-3.5 w-4 h-4 text-slate-400 dark:text-slate-400 ${isRtl ? "right-4" : "left-4"}`} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-[#1a2332] dark:text-slate-300 font-semibold">{t("auth_label_password")}</label>
            <div className="relative">
              <input
                type="password"
                placeholder="******"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className={`w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl py-3 text-sm text-[#1a2332] dark:text-white placeholder-[#6b7280] dark:placeholder-slate-400 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition ${isRtl ? "pl-4 pr-11" : "pr-4 pl-11"}`}
              />
              <Lock className={`absolute top-3.5 w-4 h-4 text-slate-400 dark:text-slate-400 ${isRtl ? "right-4" : "left-4"}`} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-brand-primary text-white hover:bg-opacity-95 font-black text-sm flex items-center justify-center gap-2 mt-2 transition shadow-md shadow-brand-primary/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            <span>{isSignUp ? t("auth_btn_signup") : t("auth_btn_signin")}</span>
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="mt-8 text-center pt-6 border-t border-slate-100 dark:border-slate-700">
          <p className="text-xs text-brand-helper dark:text-slate-400 font-semibold">
            {isSignUp ? t("auth_have_account") : t("auth_no_account")}{" "}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-brand-primary hover:text-opacity-80 font-bold transition ml-1 cursor-pointer"
            >
              {isSignUp ? t("auth_switch_signin") : t("auth_switch_signup")}
            </button>
          </p>
        </div>

        {/* Quick Language Toggle */}
        <div className="mt-6 flex justify-center">
            <button 
                onClick={() => setLanguage(lang === "ar" ? "en" : "ar")}
                className="text-[11px] text-brand-helper dark:text-slate-500 hover:text-brand-primary font-bold cursor-pointer transition underline decoration-brand-secondary/30"
            >
                {lang === "ar" ? t("switch_to_english") : t("switch_to_arabic")}
            </button>
        </div>

      </div>
    </div>
  );
}
