import React, { useState, useEffect } from "react";
import { defaultProfiles } from "./data";
import { FullProfile } from "./types";
import { BudgetOverview } from "./components/BudgetOverview";
import { GoalsTracker } from "./components/GoalsTracker";
import { ScenarioSimulator } from "./components/ScenarioSimulator";
import { SmartChat } from "./components/SmartChat";
import { 
  User, 
  Wallet, 
  Target, 
  LineChart, 
  MessageSquare, 
  Plus, 
  Check, 
  MapPin, 
  Briefcase, 
  Users, 
  Heart, 
  Edit3, 
  LogIn, 
  LogOut, 
  Cloud, 
  CloudLightning, 
  Loader2, 
  ArrowLeft, 
  ArrowRight, 
  Trash2, 
  Home,
  Sun,
  Moon,
  Settings
} from "lucide-react";
import { useAuth } from "./context/AuthContext";
import { WelcomeScreen } from "./components/WelcomeScreen";
import { OnboardingWizard } from "./components/OnboardingWizard";
import { t, getLanguage, setLanguage, getFormattedDate, formatCurrency, localizeValue } from "./lib/translations";

export default function App() {
  const { user, logout, customProfile, saveCustomProfile, loadingProfile } = useAuth();
  
  // Theme state
  const [theme, setTheme] = useState<"light" | "dark">(
    () => (localStorage.getItem("smart_budget_theme") as "light" | "dark") || "light"
  );
  const [isSettingsDropdownOpen, setIsSettingsDropdownOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("smart_budget_theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const [activeTab, setActiveTab] = useState<"overview" | "goals" | "scenarios" | "chat" | "edit">("overview");

  // Editing form state for selected profile
  const [editName, setEditName] = useState("");
  const [editAge, setEditAge] = useState(30);
  const [editMarital, setEditMarital] = useState("متزوج");
  const [editCity, setEditCity] = useState("الرياض");
  const [editJob, setEditJob] = useState("");
  const [editNetIncome, setEditNetIncome] = useState(15000);
  const [editHousing, setEditHousing] = useState(3000);
  const [editUtilities, setEditUtilities] = useState(500);
  const [editEducation, setEditEducation] = useState(500);
  const [editTransport, setEditTransport] = useState(1000);
  const [editHealth, setEditHealth] = useState(300);
  const [editPhone, setEditPhone] = useState(300);
  const [editEntertainment, setEditEntertainment] = useState(800);
  const [editClothing, setEditClothing] = useState(400);
  const [editFamily, setEditFamily] = useState(300);
  const [editDebt, setEditDebt] = useState(1500);
  const [editMisc, setEditMisc] = useState(600);
  const [editCurrentSavings, setEditCurrentSavings] = useState(10000);
  const [editEmergencyTarget, setEditEmergencyTarget] = useState(60000);

  const currentProfile = customProfile;

  // Load profile values into editing form when currentProfile changes
  useEffect(() => {
    if (currentProfile) {
      setEditName(currentProfile.profile.name);
      setEditAge(currentProfile.profile.age);
      setEditMarital(currentProfile.profile.maritalStatus);
      setEditCity(currentProfile.profile.city);
      setEditJob(currentProfile.profile.jobTitle);
      setEditNetIncome(currentProfile.monthlyIncome.primarySalary);
      setEditHousing(currentProfile.monthlyExpenses.housingRentOrMortgage);
      setEditUtilities(currentProfile.monthlyExpenses.utilities);
      setEditEducation(currentProfile.monthlyExpenses.childrenEducation || 0);
      setEditTransport(currentProfile.monthlyExpenses.transportation);
      setEditHealth(currentProfile.monthlyExpenses.healthcare);
      setEditPhone(currentProfile.monthlyExpenses.phoneInternet);
      setEditEntertainment(currentProfile.monthlyExpenses.entertainment);
      setEditClothing(currentProfile.monthlyExpenses.clothing);
      setEditFamily(currentProfile.monthlyExpenses.familyVisits);
      setEditDebt(currentProfile.monthlyExpenses.debtPayments);
      setEditMisc(currentProfile.monthlyExpenses.miscellaneous);
      setEditCurrentSavings(currentProfile.savingsPlan.currentSavings);
      setEditEmergencyTarget(currentProfile.savingsPlan.emergencyFundTarget);
    }
  }, [currentProfile]);

  const handleSaveEditProfile = () => {
    if (!currentProfile) return;

    const totalFixed = editHousing + editUtilities + editDebt + editEducation;
    const totalVariable = editFoodAndOtherSum();
    const totalExp = totalFixed + totalVariable;
    const remainingSavings = Math.max(0, editNetIncome - totalExp);

    const updated: FullProfile = {
      id: currentProfile.id,
      profile: {
        name: editName.trim() || "مستشار ذكي",
        age: editAge,
        maritalStatus: editMarital,
        childrenCount: editEducation > 0 ? 1 : 0,
        city: editCity,
        jobTitle: editJob,
        education: "جامعي",
      },
      monthlyIncome: {
        primarySalary: editNetIncome,
        totalGross: Math.round(editNetIncome * 1.1),
        deductions: {
          gosiEmployee: Math.round(editNetIncome * 0.1),
          incomeTax: 0,
          healthInsurance: editHealth,
          other: 0,
        },
        netIncome: editNetIncome,
      },
      monthlyExpenses: {
        housingRentOrMortgage: editHousing,
        utilities: editUtilities,
        foodGroceries: editClothing, // mapping clothing temporarily or maintaining general expenses
        childrenEducation: editEducation,
        transportation: editTransport,
        healthcare: editHealth,
        phoneInternet: editPhone,
        entertainment: editEntertainment,
        clothing: editClothing,
        familyVisits: editFamily,
        debtPayments: editDebt,
        miscellaneous: editMisc,
        totalExpenses: totalExp,
      },
      savingsPlan: {
        emergencyFundTarget: editEmergencyTarget,
        emergencyFundMonths: 6,
        monthlySavings: remainingSavings,
        savingsRate: parseFloat((remainingSavings / editNetIncome || 0).toFixed(2)),
        currentSavings: editCurrentSavings,
        investmentPreference: "متوازن",
      },
      financialGoals: [
        {
          goal: "تأسيس صندوق الطوارئ",
          targetAmount: editEmergencyTarget,
          timelineMonths: 12,
          monthlyNeeded: Math.round(editEmergencyTarget / 12),
        },
        {
          goal: "الهدف المالي المخصص الأول",
          targetAmount: Math.round(remainingSavings * 10),
          timelineMonths: 10,
          monthlyNeeded: remainingSavings,
        }
      ],
      simulationScenarios: [
        {
          scenarioName: "الوضع الحالي للادخار",
          monthlySavings: remainingSavings,
          projected10Years: remainingSavings * 120 + editCurrentSavings,
          projected20Years: remainingSavings * 240 + editCurrentSavings,
          notes: "بدون أي تعديل على النمط المالي الحالي",
        },
        {
          scenarioName: "ترشيد المصاريف 15%",
          monthlySavings: Math.round(remainingSavings + totalExp * 0.15),
          projected10Years: Math.round((remainingSavings + totalExp * 0.15) * 120 + editCurrentSavings),
          projected20Years: Math.round((remainingSavings + totalExp * 0.15) * 240 + editCurrentSavings),
          notes: "توفير 15% من النفقات وإدراجها بالكامل بالادخار",
        }
      ]
    };

    setActiveTab("overview");

    if (user) {
      saveCustomProfile(updated).catch((err) => {
        console.error("Failed to save custom profile to Firestore:", err);
      });
    }
  };

  const editFoodAndOtherSum = () => {
    return editClothing + editTransport + editHealth + editPhone + editEntertainment + editFamily + editMisc;
  };

  const lang = getLanguage();
  const isRtl = lang === "ar";

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center p-4 transition-colors duration-300">
        <Loader2 className="w-8 h-8 animate-spin text-brand-primary mb-4" />
        <span className="text-sm font-bold text-brand-text-dark">{t("loading_profiles_desc")}</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-brand-dark text-brand-text-dark font-sans selection:bg-brand-primary selection:text-white transition-colors duration-300" dir={isRtl ? "rtl" : "ltr"}>
        <WelcomeScreen />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-dark text-brand-text-dark font-sans selection:bg-brand-primary selection:text-white pb-12 transition-colors duration-300" dir={isRtl ? "rtl" : "ltr"}>
      {/* Navigation Header */}
      <header className="bg-brand-header border-b border-white/15 text-white sticky top-0 z-50 backdrop-blur-md bg-opacity-95 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-primary flex items-center justify-center text-white font-black text-xl shadow-lg shadow-brand-primary/20">
              S
            </div>
            <div className={isRtl ? "text-right" : "text-left"}>
              <h1 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
                {t("app_title")}
              </h1>
            </div>
          </div>

          {/* User Auth controls */}
          <div className="flex items-center gap-3">
            {/* Settings & Theme Toggle Buttons */}
            <div className="flex items-center gap-1.5 relative">
              <button
                onClick={() => setIsSettingsDropdownOpen(!isSettingsDropdownOpen)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white transition cursor-pointer relative"
                title={t("settings_menu_title")}
              >
                <Settings className="w-4.5 h-4.5" />
              </button>

              {isSettingsDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsSettingsDropdownOpen(false)} />
                  <div className={`absolute top-12 ${isRtl ? "left-0" : "right-0"} mt-1 w-64 rounded-2xl bg-brand-light border border-brand-secondary/20 shadow-xl z-50 text-brand-text-light p-2 animate-fade-in ${isRtl ? "text-right" : "text-left"} font-sans`} dir={isRtl ? "rtl" : "ltr"}>
                    <div className="px-3 py-2 border-b border-brand-secondary/10 mb-1">
                      <p className="text-xs text-brand-helper font-extrabold">{t("settings_menu_title")}</p>
                    </div>
                    
                    {/* Option 1: Edit Budget Items */}
                    <button
                      onClick={() => {
                        setIsSettingsDropdownOpen(false);
                        if (currentProfile) {
                          setActiveTab("edit");
                          setTimeout(() => {
                            const editSection = document.getElementById("edit-budget-section");
                            if (editSection) {
                              editSection.scrollIntoView({ behavior: "smooth" });
                            }
                          }, 100);
                        } else {
                          alert(t("alert_select_profile_first"));
                        }
                      }}
                      className={`w-full ${isRtl ? "text-right" : "text-left"} px-3 py-2.5 rounded-xl hover:bg-brand-dark/40 transition flex items-center justify-between text-xs font-bold cursor-pointer`}
                    >
                      <span>{t("edit_budget_items")}</span>
                      <span className="text-[10px] bg-brand-primary/10 text-brand-primary px-1.5 py-0.5 rounded font-bold">{t("badge_main")}</span>
                    </button>

                    {/* Option 2: Change language */}
                    <button
                      onClick={() => {
                        setIsSettingsDropdownOpen(false);
                        setLanguage(lang === "ar" ? "en" : "ar");
                      }}
                      className={`w-full ${isRtl ? "text-right" : "text-left"} px-3 py-2.5 rounded-xl hover:bg-brand-dark/40 transition flex items-center text-xs font-bold cursor-pointer border-t border-brand-secondary/10 mt-1 pt-2`}
                    >
                      <span>{lang === "ar" ? "تغيير اللغة - الإنجليزية" : "Change Language - Arabic"}</span>
                    </button>
                  </div>
                </>
              )}

              <button
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white transition-all duration-300 cursor-pointer"
                title={theme === "light" ? t("toggle_theme_label") + " 🌙" : t("toggle_theme_label") + " ☀️"}
              >
                {theme === "light" ? (
                  <span className="text-sm">🌙</span>
                ) : (
                  <span className="text-sm">☀️</span>
                )}
              </button>
            </div>

            <div className="hidden sm:block text-[11px] text-white/70 font-mono bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
              {t("current_date")}: <span className="text-white">{getFormattedDate()}</span>
            </div>

            {user ? (
              <div className="flex items-center gap-2.5 bg-white/10 pl-2 pr-3 py-1.5 rounded-xl border border-white/10">
                <div className={`flex flex-col ${isRtl ? "items-end text-right" : "items-start text-left"}`}>
                  <span className="text-xs font-bold text-white">{user.displayName || (isRtl ? "مستخدم جديد" : "New User")}</span>
                  <span className="text-[9px] text-white/60 font-mono">{user.email}</span>
                </div>
                <button
                  onClick={() => logout()}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-red-500/20 hover:text-red-300 text-white/75 transition cursor-pointer"
                  title={isRtl ? "تسجيل الخروج" : "Logout"}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">
        {!customProfile ? (
          <div className="animate-fade-in" dir={isRtl ? "rtl" : "ltr"}>
            <OnboardingWizard 
              onCompleted={() => {
                setActiveTab("overview");
              }} 
            />
          </div>
        ) : activeTab === "edit" ? (
          /* --- EDIT PROFILE STANDALONE PAGE --- */
          <section id="edit-budget-section" className="bg-white border border-slate-200 rounded-3xl p-6 text-[#1a2332] space-y-6 animate-fade-in shadow-md mb-8" dir={isRtl ? "rtl" : "ltr"}>
            {/* Standalone Page Header with a Back button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className={isRtl ? "text-right" : "text-left"}>
                <h4 className="text-xl font-black text-[#1a2332] flex items-center gap-2">
                  <Edit3 className="w-5.5 h-5.5 text-brand-primary" /> 
                  <span>{t("edit_budget_title")}</span>
                </h4>
                <p className="text-xs text-brand-helper font-bold mt-1">{t("edit_budget_subtitle")}</p>
              </div>
              <button
                onClick={() => setActiveTab("overview")}
                className="px-4 py-2 bg-brand-secondary hover:bg-opacity-95 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-brand-secondary/15 self-start sm:self-auto"
              >
                {isRtl ? <ArrowRight className="w-4 h-4 text-brand-primary" /> : <ArrowLeft className="w-4 h-4 text-brand-primary" />}
                <span>{t("btn_back_dashboard")}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-xs text-[#1a2332] font-bold">{t("onboarding_full_name")}:</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-[#1a2332] focus:outline-none focus:border-brand-primary font-bold shadow-sm placeholder-[#6b7280]"
                />
              </div>
              {/* Age */}
              <div className="space-y-1.5">
                <label className="text-xs text-[#1a2332] font-bold">{t("onboarding_age")}:</label>
                <input
                  type="number"
                  value={editAge}
                  onChange={(e) => setEditAge(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-[#1a2332] focus:outline-none focus:border-brand-primary font-mono shadow-sm placeholder-[#6b7280]"
                />
              </div>
              {/* City */}
              <div className="space-y-1.5">
                <label className="text-xs text-[#1a2332] font-bold">{t("onboarding_city")}:</label>
                <input
                  type="text"
                  value={editCity}
                  onChange={(e) => setEditCity(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-[#1a2332] focus:outline-none focus:border-brand-primary font-bold shadow-sm placeholder-[#6b7280]"
                />
              </div>
              {/* Job Title */}
              <div className="space-y-1.5">
                <label className="text-xs text-[#1a2332] font-bold">{t("onboarding_job")}:</label>
                <input
                  type="text"
                  value={editJob}
                  onChange={(e) => setEditJob(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-[#1a2332] focus:outline-none focus:border-brand-primary font-bold shadow-sm placeholder-[#6b7280]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
              {/* Net Income */}
              <div className="space-y-1.5">
                <label className="text-xs text-[#1a2332] font-bold">{t("onboarding_income")} ({isRtl ? "ريال" : "SAR"}):</label>
                <input
                  type="number"
                  value={editNetIncome}
                  onChange={(e) => setEditNetIncome(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-[#1a2332] font-black font-mono shadow-sm placeholder-[#6b7280]"
                />
              </div>
              {/* Current Savings */}
              <div className="space-y-1.5">
                <label className="text-xs text-[#1a2332] font-bold">{t("onboarding_current_savings")} ({isRtl ? "ريال" : "SAR"}):</label>
                <input
                  type="number"
                  value={editCurrentSavings}
                  onChange={(e) => setEditCurrentSavings(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-[#1a2332] font-black font-mono shadow-sm placeholder-[#6b7280]"
                />
              </div>
              {/* Emergency Target */}
              <div className="space-y-1.5">
                <label className="text-xs text-[#1a2332] font-bold">{t("onboarding_emergency_target")}:</label>
                <input
                  type="number"
                  value={editEmergencyTarget}
                  onChange={(e) => setEditEmergencyTarget(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-[#1a2332] focus:outline-none focus:border-brand-primary font-bold font-mono shadow-sm placeholder-[#6b7280]"
                />
              </div>
            </div>

            {/* Detailed Expenses Editor */}
            <div className="pt-4 border-t border-slate-100">
              <h5 className="text-sm font-bold text-[#1a2332] mb-3">{t("onboarding_expenses_title")} ({isRtl ? "ريال سعودي" : "SAR"})</h5>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                <div className="space-y-1">
                  <span className="text-[11px] text-brand-helper font-bold">{t("exp_housing")}:</span>
                  <input
                    type="number"
                    value={editHousing}
                    onChange={(e) => setEditHousing(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-[#1a2332] font-bold font-mono shadow-sm placeholder-[#6b7280]"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] text-brand-helper font-bold">{t("exp_utilities")}:</span>
                  <input
                    type="number"
                    value={editUtilities}
                    onChange={(e) => setEditUtilities(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-[#1a2332] font-bold font-mono shadow-sm placeholder-[#6b7280]"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] text-brand-helper font-bold">{t("exp_education")}:</span>
                  <input
                    type="number"
                    value={editEducation}
                    onChange={(e) => setEditEducation(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-[#1a2332] font-bold font-mono shadow-sm placeholder-[#6b7280]"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] text-brand-helper font-bold">{t("exp_transport")}:</span>
                  <input
                    type="number"
                    value={editTransport}
                    onChange={(e) => setEditTransport(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-[#1a2332] font-bold font-mono shadow-sm placeholder-[#6b7280]"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] text-brand-helper font-bold">{t("exp_health")}:</span>
                  <input
                    type="number"
                    value={editHealth}
                    onChange={(e) => setEditHealth(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-[#1a2332] font-bold font-mono shadow-sm placeholder-[#6b7280]"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] text-brand-helper font-bold">{t("exp_phone")}:</span>
                  <input
                    type="number"
                    value={editPhone}
                    onChange={(e) => setEditPhone(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-[#1a2332] font-bold font-mono shadow-sm placeholder-[#6b7280]"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] text-brand-helper font-bold">{t("exp_entertainment")}:</span>
                  <input
                    type="number"
                    value={editEntertainment}
                    onChange={(e) => setEditEntertainment(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-[#1a2332] font-bold font-mono shadow-sm placeholder-[#6b7280]"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] text-brand-helper font-bold">{t("exp_clothing")}:</span>
                  <input
                    type="number"
                    value={editClothing}
                    onChange={(e) => setEditClothing(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-[#1a2332] font-bold font-mono shadow-sm placeholder-[#6b7280]"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] text-brand-helper font-bold">{t("exp_family")}:</span>
                  <input
                    type="number"
                    value={editFamily}
                    onChange={(e) => setEditFamily(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-[#1a2332] font-bold font-mono shadow-sm placeholder-[#6b7280]"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] text-brand-helper font-bold">{t("exp_debts")}:</span>
                  <input
                    type="number"
                    value={editDebt}
                    onChange={(e) => setEditDebt(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-[#1a2332] font-bold font-mono shadow-sm placeholder-[#6b7280]"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] text-brand-helper font-bold">{t("exp_miscellaneous")}:</span>
                  <input
                    type="number"
                    value={editMisc}
                    onChange={(e) => setEditMisc(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-[#1a2332] font-bold font-mono shadow-sm placeholder-[#6b7280]"
                  />
                </div>
              </div>
            </div>

            {/* Actions buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-brand-secondary/15">
              <button
                onClick={() => setActiveTab("overview")}
                className="px-5 py-2.5 bg-brand-secondary/10 hover:bg-brand-secondary/20 text-brand-text-light font-bold text-xs rounded-xl transition cursor-pointer"
              >
                {t("btn_cancel")}
              </button>
              <button
                onClick={handleSaveEditProfile}
                className="px-6 py-2.5 bg-brand-primary hover:bg-opacity-95 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-lg shadow-brand-primary/10"
              >
                <Check className="w-4.5 h-4.5 text-white" />
                <span>{t("btn_save_changes")}</span>
              </button>
            </div>
          </section>
        ) : (
          /* --- ACTIVE DASHBOARD VIEW --- */
          <>
            {/* Active profile quick overview bar */}
            <section className="bg-brand-light border border-brand-secondary/15 rounded-3xl p-5 text-brand-text-light shadow-md animate-fade-in" dir={isRtl ? "rtl" : "ltr"}>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center font-black">
                    <User className="w-6 h-6" />
                  </div>
                  <div className={isRtl ? "text-right" : "text-left"}>
                    <h3 className="font-black text-xl text-brand-text-light flex items-center gap-2">
                      {currentProfile.profile.name}
                      <span className="text-xs bg-brand-primary/10 text-brand-primary px-2 py-0.5 rounded-lg border border-brand-primary/20 font-bold">
                        {localizeValue(currentProfile.profile.jobTitle)}
                      </span>
                    </h3>
                    <p className="text-xs text-brand-helper font-bold mt-1">
                      {t("card_city")}: {localizeValue(currentProfile.profile.city)} • {t("status_label")} {localizeValue(currentProfile.profile.maritalStatus)} {currentProfile.profile.childrenCount > 0 ? ` • ${t("dependents_label")}: ${currentProfile.profile.childrenCount}` : ""}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="bg-brand-light border border-brand-secondary/15 px-4 py-2 rounded-xl text-xs font-bold text-brand-text-light flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                    <span>{t("card_savings_rate")}: <strong className="text-brand-primary font-extrabold">{Math.round(currentProfile.savingsPlan.savingsRate * 100)}%</strong></span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-brand-success bg-brand-success/10 px-3 py-2 rounded-xl border border-brand-success/20 font-bold">
                    <span className="w-2 h-2 rounded-full bg-brand-success animate-pulse"></span>
                    <span>{t("cloud_active")}</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Dynamic Navigation Tabs */}
            <section className="flex border-b border-slate-200 overflow-x-auto pb-1 gap-1.5 scrollbar-none" dir={isRtl ? "rtl" : "ltr"}>
              <button
                onClick={() => setActiveTab("overview")}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-bold transition duration-200 border-b-2 shrink-0 cursor-pointer ${
                  activeTab === "overview"
                    ? "border-brand-primary text-brand-primary"
                    : "border-transparent text-[#7f8c8d] hover:text-[#4a5568]"
                }`}
              >
                <Wallet className="w-4.5 h-4.5" />
                <span>{t("tab_overview")}</span>
              </button>

              <button
                onClick={() => setActiveTab("goals")}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-bold transition duration-200 border-b-2 shrink-0 cursor-pointer ${
                  activeTab === "goals"
                    ? "border-brand-primary text-brand-primary"
                    : "border-transparent text-[#7f8c8d] hover:text-[#4a5568]"
                }`}
              >
                <Target className="w-4.5 h-4.5" />
                <span>{t("tab_goals")}</span>
              </button>

              <button
                onClick={() => setActiveTab("scenarios")}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-bold transition duration-200 border-b-2 shrink-0 cursor-pointer ${
                  activeTab === "scenarios"
                    ? "border-brand-primary text-brand-primary"
                    : "border-transparent text-[#7f8c8d] hover:text-[#4a5568]"
                }`}
              >
                <LineChart className="w-4.5 h-4.5" />
                <span>{t("tab_simulator")}</span>
              </button>

              <button
                onClick={() => setActiveTab("chat")}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-bold transition duration-200 border-b-2 shrink-0 shrink-0 cursor-pointer ${
                  activeTab === "chat"
                    ? "border-brand-primary text-brand-primary"
                    : "border-transparent text-[#7f8c8d] hover:text-[#4a5568]"
                }`}
              >
                <MessageSquare className="w-4.5 h-4.5" />
                <span>{t("tab_chat")}</span>
              </button>
            </section>

            {/* Tab Contents View */}
            <div className="space-y-6">
              {activeTab === "overview" && <BudgetOverview currentProfile={currentProfile} />}
              {activeTab === "goals" && <GoalsTracker currentProfile={currentProfile} />}
              {activeTab === "scenarios" && <ScenarioSimulator currentProfile={currentProfile} />}
              {activeTab === "chat" && <SmartChat currentProfile={currentProfile} />}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
