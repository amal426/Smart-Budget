import React, { useState, useRef, useEffect } from "react";
import { FullProfile, ChatMessage } from "../types";
import { Send, Bot, User, Sparkles, AlertCircle, HelpCircle } from "lucide-react";
import { t, getLanguage, formatCurrency, localizeValue } from "../lib/translations";

interface SmartChatProps {
  currentProfile: FullProfile;
}

// Custom simple parser to format basic markdown elements securely in text based on direction
const formatText = (text: string, isRtl: boolean) => {
  // Replace bold markdown **text** with styled strong tag
  let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-brand-primary font-bold">$1</strong>');
  
  // Format bullet points
  const lines = formatted.split("\n");
  const processedLines = lines.map((line) => {
    const trimmed = line.trim();
    const listMargin = isRtl ? "mr-4" : "ml-4";
    if (trimmed.startsWith("- ")) {
      return `<li class="${listMargin} list-disc text-brand-text-light my-1 font-medium">${trimmed.substring(2)}</li>`;
    }
    if (trimmed.match(/^\d+\.\s/)) {
      const match = trimmed.match(/^(\d+)\.\s(.*)/);
      if (match) {
        return `<li class="${listMargin} list-decimal text-brand-text-light my-1 font-medium">${match[2]}</li>`;
      }
    }
    return trimmed === "" ? "<br/>" : `<p class="my-1.5 leading-relaxed text-brand-text-light font-medium">${trimmed}</p>`;
  });

  return processedLines.join("");
};

export const SmartChat: React.FC<SmartChatProps> = ({ currentProfile }) => {
  const { profile, monthlyIncome, monthlyExpenses } = currentProfile;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const lang = getLanguage();
  const isRtl = lang === "ar";
  const textDir = isRtl ? "text-right" : "text-left";

  // Starter prompts based on the current language
  const getStarterPrompts = () => {
    return [
      t("chat_starter_1"),
      t("chat_starter_2"),
      t("chat_starter_3"),
      t("chat_starter_4"),
    ];
  };

  // Setup initial message when profile changes
  useEffect(() => {
    const welcomeText = isRtl
      ? `مرحباً بك يا ${profile.name}! 👋 أنا **Smart Budget**، مستشارك المالي الذكي المخصص لمساعدتك في المملكة العربية السعودية.

لقد قمت بتحليل ملفك المالي في مدينة **${localizeValue(profile.city)}** (صافي دخلك شهرياً **${formatCurrency(monthlyIncome.netIncome)}** ومصروفاتك **${formatCurrency(monthlyExpenses.totalExpenses)}**).

أنا جاهز الآن لمساعدتك في تنظيم ميزانيتك، الإجابة عن تساؤلاتك حول الاستقطاعات والتأمين، وتحليل سيناريوهات الادخار المستقبلية. ما الذي ترغب في نقاشه اليوم؟`
      : `Welcome, ${profile.name}! 👋 I am **Smart Budget**, your dedicated smart financial advisor in the Kingdom of Saudi Arabia.

I have analyzed your financial profile in **${localizeValue(profile.city)}** (your net monthly income is **${formatCurrency(monthlyIncome.netIncome)}** and your expenses are **${formatCurrency(monthlyExpenses.totalExpenses)}**).

I am ready to help you organize your budget, answer questions about GOSI and deductions, and analyze future savings scenarios. What would you like to discuss today?`;

    const localeString = isRtl ? "ar-SA" : "en-US";

    setMessages([
      {
        id: "welcome",
        role: "model",
        text: welcomeText,
        timestamp: new Date().toLocaleTimeString(localeString, { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  }, [currentProfile.id, lang]);

  // Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    setErrorMsg(null);
    const localeString = isRtl ? "ar-SA" : "en-US";
    const userMsg: ChatMessage = {
      id: Date.now().toString() + "-user",
      role: "user",
      text: text,
      timestamp: new Date().toLocaleTimeString(localeString, { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Map message history to simple role/text format
      const history = messages.slice(1).map((msg) => ({
        role: msg.role,
        text: msg.text,
      }));

      // Send to server-side Gemini API route, forwarding the chosen language
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: history,
          profileContext: currentProfile,
          lang: lang,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || t("chat_error_connect"));
      }

      const data = await response.json();

      const modelMsg: ChatMessage = {
        id: Date.now().toString() + "-model",
        role: "model",
        text: data.text,
        timestamp: new Date().toLocaleTimeString(localeString, { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, modelMsg]);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || t("chat_error_unexpected"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`bg-brand-light border border-brand-secondary/15 rounded-2xl flex flex-col h-[600px] overflow-hidden text-brand-text-light shadow-md ${textDir}`} dir={isRtl ? "rtl" : "ltr"}>
      {/* Assistant Header */}
      <div className="bg-brand-dark/40 p-4 border-b border-brand-secondary/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-brand-primary flex items-center justify-center text-white shadow-inner">
              <Bot className="w-5.5 h-5.5" />
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-brand-success border-2 border-white rounded-full"></span>
          </div>
          <div>
            <h4 className="font-bold text-sm text-brand-text-light flex items-center gap-1.5">
              Smart Budget <span className="text-[10px] bg-brand-primary/10 text-brand-primary px-2 py-0.5 rounded-full font-bold">{t("chat_header_badge")}</span>
            </h4>
            <p className="text-[11px] text-brand-helper font-bold">{t("chat_header_desc")}</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-1 text-[11px] text-brand-helper bg-brand-dark px-3 py-1 rounded-full font-bold">
          <Sparkles className="w-3.5 h-3.5 text-brand-primary" />
          <span>{t("chat_on_numbers_badge")}</span>
        </div>
      </div>

      {/* Messages Window */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-brand-dark/20">
        {messages.map((msg) => {
          const isModel = msg.role === "model";
          return (
            <div key={msg.id} className={`flex ${isModel ? "justify-start" : "justify-end"} items-start gap-2.5`}>
              {isModel && (
                <div className="w-8 h-8 rounded-lg bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center shrink-0 text-brand-primary">
                  <Bot className="w-4.5 h-4.5" />
                </div>
              )}
              <div className="flex flex-col max-w-[85%] space-y-1">
                <div
                  className={`p-3.5 rounded-2xl text-sm leading-relaxed ${
                    isModel
                      ? `bg-brand-light text-brand-text-light border border-brand-secondary/15 shadow-sm ${isRtl ? "rounded-tr-none" : "rounded-tl-none"}`
                      : `bg-brand-primary text-white font-bold shadow-sm ${isRtl ? "rounded-tl-none" : "rounded-tr-none"}`
                  }`}
                >
                  {isModel ? (
                    <div
                      className="space-y-1.5 break-words"
                      dangerouslySetInnerHTML={{ __html: formatText(msg.text, isRtl) }}
                    ></div>
                  ) : (
                    <p className="break-words whitespace-pre-wrap">{msg.text}</p>
                  )}
                </div>
                <span className={`text-[10px] text-brand-helper font-bold font-mono ${isModel ? "self-start" : "self-end"}`}>{msg.timestamp}</span>
              </div>
              {!isModel && (
                <div className="w-8 h-8 rounded-lg bg-brand-secondary flex items-center justify-center shrink-0 text-white">
                  <User className="w-4.5 h-4.5" />
                </div>
              )}
            </div>
          );
        })}

        {/* Loading / Typing State */}
        {isLoading && (
          <div className="flex justify-start items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center shrink-0 text-brand-primary animate-pulse">
              <Bot className="w-4.5 h-4.5" />
            </div>
            <div className={`bg-brand-light p-3.5 rounded-2xl border border-brand-secondary/15 shadow-sm flex items-center gap-1.5 ${isRtl ? "rounded-tr-none" : "rounded-tl-none"}`}>
              <span className="w-2 h-2 bg-brand-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
              <span className="w-2 h-2 bg-brand-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
              <span className="w-2 h-2 bg-brand-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
            </div>
          </div>
        )}

        {/* Error Notification */}
        {errorMsg && (
          <div className="bg-rose-500/5 border border-rose-500/10 rounded-xl p-3 text-red-500 text-xs flex items-center gap-2 font-bold">
            <AlertCircle className="w-4.5 h-4.5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Starter Prompts Bar */}
      <div className="bg-brand-dark/40 p-3 border-t border-brand-secondary/10">
        <div className="flex items-center gap-1 text-[11px] text-brand-helper font-bold mb-2">
          <HelpCircle className="w-3.5 h-3.5 text-brand-primary" />
          <span>{isRtl ? "أسئلة مقترحة لتحليل ميزانيتك:" : "Suggested questions to analyze your budget:"}</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar scrollbar-none snap-x">
          {getStarterPrompts().map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleSendMessage(prompt)}
              disabled={isLoading}
              className={`${isRtl ? "text-right" : "text-left"} shrink-0 bg-brand-light border border-brand-secondary/15 hover:border-brand-primary/40 hover:bg-brand-dark/40 text-xs text-brand-text-light px-3 py-1.5 rounded-xl transition cursor-pointer snap-start disabled:opacity-50 disabled:pointer-events-none font-bold shadow-sm`}
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(inputValue);
        }}
        className="bg-brand-light p-3 border-t border-brand-secondary/10 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={isLoading}
          placeholder={t("chat_placeholder")}
          className="flex-1 bg-brand-dark border border-brand-secondary/15 focus:border-brand-primary focus:outline-none rounded-xl px-4 py-2.5 text-sm text-brand-text-light placeholder-slate-400 transition disabled:opacity-75"
        />
        <button
          type="submit"
          disabled={!inputValue.trim() || isLoading}
          className="bg-brand-primary hover:bg-opacity-90 text-white p-2.5 rounded-xl transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0 shadow-md"
        >
          <Send className={`w-4.5 h-4.5 ${isRtl ? "transform rotate-180" : ""}`} />
        </button>
      </form>
    </div>
  );
};
