import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { FullProfile } from "../types";
import { 
  User, 
  Wallet, 
  CreditCard, 
  Target, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Loader2, 
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { t, getLanguage, formatCurrency } from "../lib/translations";

interface OnboardingWizardProps {
  onCompleted: (profile: FullProfile) => void;
}

export function OnboardingWizard({ onCompleted }: OnboardingWizardProps) {
  const { user, saveCustomProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lang = getLanguage();
  const isRtl = lang === "ar";
  const textDir = isRtl ? "text-right" : "text-left";
  const currencyLabel = isRtl ? "ر.س" : "SAR";
  const debtPeriodLabel = isRtl ? "ر.س / شهر" : "SAR / Month";

  // --- FORM STATES ---
  // Step 1: Personal Details
  const [name, setName] = useState("");
  const [age, setAge] = useState<number | "">("");
  const [maritalStatus, setMaritalStatus] = useState("");
  const [dependents, setDependents] = useState<number | "">(""); // عدد أفراد الأسرة المعالين
  const [city, setCity] = useState("");
  const [jobTitle, setJobTitle] = useState("");

  // Step 2: Income & Fixed Commitments
  const [netIncome, setNetIncome] = useState<number | "">(""); // الدخل الشهري الصافي
  const [housing, setHousing] = useState<number | "">(""); // إيجار أو قسط السكن
  const [utilities, setUtilities] = useState<number | "">(""); // فواتير واشتراكات
  const [hasPreviousDebt, setHasPreviousDebt] = useState<boolean>(false); // وجود التزامات سابقة
  const [debtAmount, setDebtAmount] = useState<number | "">(""); // أقساط الديون والقروض
  const [education, setEducation] = useState<number | "">(""); // رسوم تعليم الأبناء والمدارس

  // Step 3: Variable Expenses
  const [food, setFood] = useState<number | "">(""); // طعام ومقاضي
  const [transport, setTransport] = useState<number | "">(""); // مواصلات وبنزين
  const [healthcare, setHealthcare] = useState<number | "">(""); // رعاية صحية
  const [phone, setPhone] = useState<number | "">(""); // اتصالات وإنترنت
  const [entertainment, setEntertainment] = useState<number | "">(""); // ترفيه ومطاعم
  const [clothing, setClothing] = useState<number | "">(""); // ملابس وكسوة
  const [family, setFamily] = useState<number | "">(""); // زيارات عائلية وواجبات
  const [misc, setMisc] = useState<number | "">(""); // مصاريف نثرية وأخرى

  // Step 4: Goals & Savings
  const [currentSavings, setCurrentSavings] = useState<number | "">(""); // الادخار الحالي
  const [emergencyTarget, setEmergencyTarget] = useState<number | "">(""); // صندوق الطوارئ المستهدف
  
  // Short-term Goal
  const [shortGoalName, setShortGoalName] = useState("");
  const [shortGoalTarget, setShortGoalTarget] = useState<number | "">("");
  const [shortGoalMonths, setShortGoalMonths] = useState<number | "">("");

  // Long-term Goal
  const [longGoalName, setLongGoalName] = useState("");
  const [longGoalTarget, setLongGoalTarget] = useState<number | "">("");
  const [longGoalMonths, setLongGoalMonths] = useState<number | "">("");

  // Helper validation
  const validateStep = (): boolean => {
    setError(null);
    if (step === 1) {
      if (age === "" || age <= 0) {
        setError(t("wizard_error_fill"));
        return false;
      }
      if (dependents === "" || dependents < 0) {
        setError(t("wizard_error_fill"));
        return false;
      }
    } else if (step === 2) {
      if (netIncome === "" || netIncome <= 0) {
        setError(t("wizard_error_income_positive"));
        return false;
      }
      if (
        (housing !== "" && housing < 0) || 
        (utilities !== "" && utilities < 0) || 
        (hasPreviousDebt && debtAmount !== "" && debtAmount < 0) || 
        (education !== "" && education < 0)
      ) {
        setError(t("wizard_error_negative_expenses"));
        return false;
      }
    } else if (step === 3) {
      const f = food === "" ? 0 : food;
      const tr = transport === "" ? 0 : transport;
      const hc = healthcare === "" ? 0 : healthcare;
      const ph = phone === "" ? 0 : phone;
      const ent = entertainment === "" ? 0 : entertainment;
      const cl = clothing === "" ? 0 : clothing;
      const fam = family === "" ? 0 : family;
      const ms = misc === "" ? 0 : misc;
      const sum = f + tr + hc + ph + ent + cl + fam + ms;
      if (sum < 0) {
        setError(t("wizard_error_variable_expenses"));
        return false;
      }
    } else if (step === 4) {
      if (
        (currentSavings !== "" && currentSavings < 0) || 
        (emergencyTarget !== "" && emergencyTarget < 0) || 
        (shortGoalTarget !== "" && shortGoalTarget < 0) || 
        (longGoalTarget !== "" && longGoalTarget < 0)
      ) {
        setError(t("wizard_error_savings"));
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setError(null);
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setLoading(true);

    const valIncome = netIncome === "" ? 0 : netIncome;
    const valHousing = housing === "" ? 0 : housing;
    const valUtilities = utilities === "" ? 0 : utilities;
    const valDebtAmount = debtAmount === "" ? 0 : debtAmount;
    const valEducation = education === "" ? 0 : education;

    const valFood = food === "" ? 0 : food;
    const valTransport = transport === "" ? 0 : transport;
    const valHealthcare = healthcare === "" ? 0 : healthcare;
    const valPhone = phone === "" ? 0 : phone;
    const valEntertainment = entertainment === "" ? 0 : entertainment;
    const valClothing = clothing === "" ? 0 : clothing;
    const valFamily = family === "" ? 0 : family;
    const valMisc = misc === "" ? 0 : misc;

    const valCurrentSavings = currentSavings === "" ? 0 : currentSavings;
    const valEmergencyTarget = emergencyTarget === "" ? 0 : emergencyTarget;
    const valShortGoalTarget = shortGoalTarget === "" ? 0 : shortGoalTarget;
    const valShortGoalMonths = shortGoalMonths === "" ? 6 : shortGoalMonths;
    const valLongGoalTarget = longGoalTarget === "" ? 0 : longGoalTarget;
    const valLongGoalMonths = longGoalMonths === "" ? 36 : longGoalMonths;

    // Calculate aggregated parameters
    const totalFixed = valHousing + valUtilities + (hasPreviousDebt ? valDebtAmount : 0) + valEducation;
    const totalVariable = valFood + valTransport + valHealthcare + valPhone + valEntertainment + valClothing + valFamily + valMisc;
    const totalExp = totalFixed + totalVariable;

    const remainingSavings = Math.max(0, valIncome - totalExp);

    // Construct the complete FullProfile object
    const calculatedProfile: FullProfile = {
      id: "custom",
      profile: {
        name: name.trim() || t("smart_advisor_default"),
        age: age === "" ? 30 : age,
        maritalStatus: maritalStatus || (isRtl ? "متزوج" : "Married"),
        childrenCount: dependents === "" ? 0 : dependents,
        city: city.trim() || (isRtl ? "الرياض" : "Riyadh"),
        jobTitle: jobTitle.trim() || (isRtl ? "موظف قطاع خاص" : "Private Sector Employee"),
        education: isRtl ? "جامعي" : "University",
      },
      monthlyIncome: {
        primarySalary: valIncome,
        totalGross: Math.round(valIncome * 1.1),
        deductions: {
          gosiEmployee: Math.round(valIncome * 0.1),
          incomeTax: 0,
          healthInsurance: valHealthcare,
          other: 0,
        },
        netIncome: valIncome,
      },
      monthlyExpenses: {
        housingRentOrMortgage: valHousing,
        utilities: valUtilities,
        foodGroceries: valFood,
        childrenEducation: valEducation,
        transportation: valTransport,
        healthcare: valHealthcare,
        phoneInternet: valPhone,
        entertainment: valEntertainment,
        clothing: valClothing,
        familyVisits: valFamily,
        debtPayments: hasPreviousDebt ? valDebtAmount : 0,
        miscellaneous: valMisc,
        totalExpenses: totalExp,
      },
      savingsPlan: {
        emergencyFundTarget: valEmergencyTarget,
        emergencyFundMonths: 6,
        monthlySavings: remainingSavings,
        savingsRate: parseFloat((remainingSavings / (valIncome || 1)).toFixed(2)),
        currentSavings: valCurrentSavings,
        investmentPreference: isRtl ? "متوازن" : "Balanced",
      },
      financialGoals: [
        {
          goal: isRtl ? "تأسيس صندوق الطوارئ" : "Establish Emergency Fund",
          targetAmount: valEmergencyTarget,
          timelineMonths: 12,
          monthlyNeeded: Math.round(valEmergencyTarget / 12),
        },
        {
          goal: shortGoalName || (isRtl ? "هدف قصير المدى" : "Short-term Goal"),
          targetAmount: valShortGoalTarget,
          timelineMonths: valShortGoalMonths,
          monthlyNeeded: Math.round(valShortGoalTarget / (valShortGoalMonths || 1)),
        },
        {
          goal: longGoalName || (isRtl ? "هدف طويل المدى" : "Long-term Goal"),
          targetAmount: valLongGoalTarget,
          timelineMonths: valLongGoalMonths,
          monthlyNeeded: Math.round(valLongGoalTarget / (valLongGoalMonths || 1)),
        },
      ],
      simulationScenarios: [
        {
          scenarioName: t("scenario_current_name"),
          monthlySavings: remainingSavings,
          projected10Years: remainingSavings * 120 + valCurrentSavings,
          projected20Years: remainingSavings * 240 + valCurrentSavings,
          notes: t("scenario_current_notes"),
        },
        {
          scenarioName: t("scenario_rationalize_name"),
          monthlySavings: Math.round(remainingSavings + totalExp * 0.15),
          projected10Years: Math.round((remainingSavings + totalExp * 0.15) * 120 + valCurrentSavings),
          projected20Years: Math.round((remainingSavings + totalExp * 0.15) * 240 + valCurrentSavings),
          notes: t("scenario_rationalize_notes"),
        },
        {
          scenarioName: t("scenario_invest_name"),
          monthlySavings: remainingSavings,
          investmentReturn: 0.07,
          projected10Years: Math.round(
            valCurrentSavings * Math.pow(1 + 0.07 / 12, 120) +
              remainingSavings * ((Math.pow(1 + 0.07 / 12, 120) - 1) / (0.07 / 12)) * (1 + 0.07 / 12)
          ),
          projected20Years: Math.round(
            valCurrentSavings * Math.pow(1 + 0.07 / 12, 240) +
              remainingSavings * ((Math.pow(1 + 0.07 / 12, 240) - 1) / (0.07 / 12)) * (1 + 0.07 / 12)
          ),
          notes: t("scenario_invest_notes"),
        },
      ],
    };

    try {
      await saveCustomProfile(calculatedProfile);
      onCompleted(calculatedProfile);
    } catch (err: any) {
      console.error(err);
      setError(t("wizard_error_save_cloud") + (err.message || ""));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`w-full max-w-3xl mx-auto bg-brand-light border border-slate-200 rounded-3xl shadow-xl p-6 md:p-10 text-brand-text-light animate-fade-in ${textDir}`} dir={isRtl ? "rtl" : "ltr"}>
      
      {/* Header Indicators */}
      <div className="flex flex-col items-center text-center mb-8">
        <span className="px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-bold mb-2">
          {t("wizard_badge_title")}
        </span>
        <h2 className="text-2xl md:text-3xl font-black text-brand-text-light">
          {t("wizard_onboarding_title")}
        </h2>
        <p className="text-xs text-brand-helper font-bold mt-2 max-w-md leading-relaxed">
          {t("wizard_onboarding_subtitle")}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="relative mb-10">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-slate-100"></div>
        </div>
        <div className="relative flex justify-between">
          {[1, 2, 3, 4].map((stepNum) => (
            <div key={stepNum} className="flex flex-col items-center">
              <span
                className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold transition-all duration-300 ${
                  step === stepNum
                    ? "bg-brand-primary text-white ring-4 ring-brand-primary/20 shadow-md"
                    : step > stepNum
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-400 border border-slate-200"
                }`}
              >
                {step > stepNum ? <Check className="w-4 h-4" /> : stepNum}
              </span>
              <span className="text-[10px] text-brand-helper font-bold mt-2">
                {stepNum === 1 && t("wizard_step_indicator_1")}
                {stepNum === 2 && t("wizard_step_indicator_2")}
                {stepNum === 3 && t("wizard_step_indicator_3")}
                {stepNum === 4 && t("wizard_step_indicator_4")}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-150 rounded-2xl flex items-start gap-3 text-sm text-red-700 animate-shake font-bold">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>{error}</div>
        </div>
      )}

      {/* STEP CONTENT CONTAINER */}
      <div className="min-h-[320px] bg-slate-50 border border-slate-200/60 rounded-2xl p-5 md:p-8 mb-8">
        
        {/* STEP 1: Personal Details */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-5 h-5 text-brand-primary" />
              <h3 className="text-lg font-bold text-[#1a2332]">{t("wizard_step_1_header")}</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Name */}
              <div className="space-y-2">
                <label className="text-xs text-[#1a2332] font-bold block">{t("wizard_label_username")}</label>
                <input
                  type="text"
                  placeholder={t("wizard_placeholder_username")}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-[#1a2332] placeholder-[#6b7280] focus:outline-none focus:border-brand-primary transition shadow-sm ${textDir}`}
                />
              </div>

              {/* Age */}
              <div className="space-y-2">
                <label className="text-xs text-[#1a2332] font-bold block">{t("wizard_label_age")}</label>
                <input
                  type="number"
                  placeholder={isRtl ? "العمر بالسنوات - مثال: 30" : "Age in years - e.g. 30"}
                  value={age}
                  onChange={(e) => setAge(e.target.value === "" ? "" : Math.max(1, parseInt(e.target.value) || 0))}
                  className={`w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-[#1a2332] placeholder-[#6b7280] focus:outline-none focus:border-brand-primary transition shadow-sm ${textDir}`}
                />
              </div>

              {/* Marital Status */}
              <div className="space-y-2">
                <label className="text-xs text-[#1a2332] font-bold block">{t("wizard_label_marital")}</label>
                <select
                  value={maritalStatus}
                  onChange={(e) => setMaritalStatus(e.target.value)}
                  className={`w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-[#1a2332] focus:outline-none focus:border-brand-primary transition shadow-sm cursor-pointer ${textDir}`}
                >
                  <option value="" className="text-[#1a2332]">{isRtl ? "اختر الحالة الاجتماعية..." : "Select Marital Status..."}</option>
                  <option value="أعزب" className="text-[#1a2332]">{t("wizard_marital_single")}</option>
                  <option value="متزوج" className="text-[#1a2332]">{t("wizard_marital_married")}</option>
                  <option value="مطلق" className="text-[#1a2332]">{t("wizard_marital_divorced")}</option>
                  <option value="أرمل" className="text-[#1a2332]">{t("wizard_marital_widowed")}</option>
                </select>
              </div>

              {/* Dependents count */}
              <div className="space-y-2">
                <label className="text-xs text-[#1a2332] font-bold block flex items-center gap-1.5">
                  <span>{t("wizard_label_dependents")}</span>
                  <span className="text-[10px] text-brand-helper font-normal">{t("wizard_dependents_note")}</span>
                </label>
                <input
                  type="number"
                  placeholder={isRtl ? "عدد التابعين المعالين - مثال: 2" : "Number of dependents - e.g. 2"}
                  value={dependents}
                  onChange={(e) => setDependents(e.target.value === "" ? "" : Math.max(0, parseInt(e.target.value) || 0))}
                  className={`w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-[#1a2332] placeholder-[#6b7280] focus:outline-none focus:border-brand-primary transition shadow-sm cursor-pointer ${textDir}`}
                />
              </div>

              {/* City */}
              <div className="space-y-2">
                <label className="text-xs text-[#1a2332] font-bold block">{t("wizard_label_city")}</label>
                <input
                  type="text"
                  placeholder={t("wizard_placeholder_city")}
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className={`w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-[#1a2332] placeholder-[#6b7280] focus:outline-none focus:border-brand-primary transition shadow-sm ${textDir}`}
                />
              </div>

              {/* Job Title */}
              <div className="space-y-2">
                <label className="text-xs text-[#1a2332] font-bold block">{t("wizard_label_job")}</label>
                <input
                  type="text"
                  placeholder={t("wizard_placeholder_job")}
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className={`w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-[#1a2332] placeholder-[#6b7280] focus:outline-none focus:border-brand-primary transition shadow-sm ${textDir}`}
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Income & Fixed Commitments */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-5 h-5 text-brand-primary" />
              <h3 className="text-lg font-bold text-[#1a2332]">{t("wizard_step_2_header")}</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Net Monthly Income */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs text-[#1a2332] font-bold block flex items-center justify-between">
                  <span>{t("wizard_label_income")}</span>
                  <span className="text-[10px] text-brand-helper font-normal">{t("wizard_income_note")}</span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    placeholder={isRtl ? "الدخل الشهري الصافي - مثال: 15000" : "Net monthly income - e.g. 15000"}
                    value={netIncome}
                    onChange={(e) => setNetIncome(e.target.value === "" ? "" : Math.max(0, parseInt(e.target.value) || 0))}
                    className="flex-1 w-full bg-white border-2 border-brand-primary rounded-xl px-4 py-3.5 text-base font-black text-[#1a2332] placeholder-[#6b7280] focus:outline-none focus:border-brand-primary transition text-left font-mono shadow-sm"
                  />
                  <span className="text-sm font-bold text-brand-helper whitespace-nowrap">{currencyLabel}</span>
                </div>
              </div>

              {/* Housing Rent or Mortgage */}
              <div className="space-y-2">
                <label className="text-xs text-[#1a2332] font-bold block">{t("wizard_label_housing")}</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    placeholder={isRtl ? "قسط/إيجار السكن - مثال: 3000" : "Housing rent/mortgage - e.g. 3000"}
                    value={housing}
                    onChange={(e) => setHousing(e.target.value === "" ? "" : Math.max(0, parseInt(e.target.value) || 0))}
                    className="flex-1 w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-[#1a2332] placeholder-[#6b7280] focus:outline-none focus:border-brand-primary transition text-left font-mono shadow-sm"
                  />
                  <span className="text-sm font-bold text-brand-helper whitespace-nowrap">{currencyLabel}</span>
                </div>
              </div>

              {/* Utilities & Subscriptions */}
              <div className="space-y-2">
                <label className="text-xs text-[#1a2332] font-bold block">{t("wizard_label_utilities")}</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    placeholder={isRtl ? "الفواتير والخدمات - مثال: 500" : "Utility bills - e.g. 500"}
                    value={utilities}
                    onChange={(e) => setUtilities(e.target.value === "" ? "" : Math.max(0, parseInt(e.target.value) || 0))}
                    className="flex-1 w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-[#1a2332] placeholder-[#6b7280] focus:outline-none focus:border-brand-primary transition text-left font-mono shadow-sm"
                  />
                  <span className="text-sm font-bold text-brand-helper whitespace-nowrap">{currencyLabel}</span>
                </div>
              </div>

              {/* Children Education Fees */}
              <div className="space-y-2">
                <label className="text-xs text-[#1a2332] font-bold block">{t("wizard_label_education")}</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    placeholder={isRtl ? "رسوم التعليم - مثال: 500" : "Education fees - e.g. 500"}
                    value={education}
                    onChange={(e) => setEducation(e.target.value === "" ? "" : Math.max(0, parseInt(e.target.value) || 0))}
                    className="flex-1 w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-[#1a2332] placeholder-[#6b7280] focus:outline-none focus:border-brand-primary transition text-left font-mono shadow-sm"
                  />
                  <span className="text-sm font-bold text-brand-helper whitespace-nowrap">{currencyLabel}</span>
                </div>
              </div>

              {/* Debt commitments Boolean check */}
              <div className="space-y-4 bg-white p-4 border border-slate-200 rounded-xl flex flex-col justify-between shadow-sm">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-[#1a2332] font-bold">{t("wizard_label_has_debt")}</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setHasPreviousDebt(true)}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                        hasPreviousDebt ? "bg-red-50 text-red-700 border border-red-200" : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {t("wizard_label_yes")}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setHasPreviousDebt(false);
                        setDebtAmount("");
                      }}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                        !hasPreviousDebt ? "bg-slate-100 text-[#1a2332] border border-slate-200" : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {t("wizard_label_no")}
                    </button>
                  </div>
                </div>

                {hasPreviousDebt && (
                  <div className="space-y-1.5 animate-fade-in mt-2">
                    <span className="text-[10px] text-red-700 block font-bold">{t("wizard_debt_amount_label")}</span>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        placeholder={isRtl ? "قسط الديون - مثال: 1500" : "Debt payments - e.g. 1500"}
                        value={debtAmount}
                        onChange={(e) => setDebtAmount(e.target.value === "" ? "" : Math.max(0, parseInt(e.target.value) || 0))}
                        className="flex-1 w-full bg-white border border-red-200 rounded-lg px-3 py-2 text-xs text-red-700 focus:outline-none focus:border-red-400 transition text-left font-mono shadow-sm"
                      />
                      <span className="text-sm font-bold text-brand-helper whitespace-nowrap">{debtPeriodLabel}</span>
                </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Variable Expenses */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="w-5 h-5 text-brand-primary" />
              <h3 className="text-lg font-bold text-[#1a2332]">{t("wizard_step_3_header")}</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Food */}
              <div className="space-y-2">
                <label className="text-xs text-[#1a2332] font-bold block">{t("wizard_label_food")}</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    placeholder={isRtl ? "الطعام والمقاضي - مثال: 2000" : "Food & groceries - e.g. 2000"}
                    value={food}
                    onChange={(e) => setFood(e.target.value === "" ? "" : Math.max(0, parseInt(e.target.value) || 0))}
                    className="flex-1 w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-[#1a2332] placeholder-[#6b7280] focus:outline-none focus:border-brand-primary transition text-left font-mono shadow-sm"
                  />
                  <span className="text-sm font-bold text-brand-helper whitespace-nowrap">{currencyLabel}</span>
                </div>
              </div>

              {/* Transport */}
              <div className="space-y-2">
                <label className="text-xs text-[#1a2332] font-bold block">{t("wizard_label_transport")}</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    placeholder={isRtl ? "البنزين والمواصلات - مثال: 1000" : "Transport & fuel - e.g. 1000"}
                    value={transport}
                    onChange={(e) => setTransport(e.target.value === "" ? "" : Math.max(0, parseInt(e.target.value) || 0))}
                    className="flex-1 w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-[#1a2332] placeholder-[#6b7280] focus:outline-none focus:border-brand-primary transition text-left font-mono shadow-sm"
                  />
                  <span className="text-sm font-bold text-brand-helper whitespace-nowrap">{currencyLabel}</span>
                </div>
              </div>

              {/* Phone & Internet */}
              <div className="space-y-2">
                <label className="text-xs text-[#1a2332] font-bold block">{t("wizard_label_phone")}</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    placeholder={isRtl ? "الجوال والإنترنت - مثال: 300" : "Phone & internet - e.g. 300"}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value === "" ? "" : Math.max(0, parseInt(e.target.value) || 0))}
                    className="flex-1 w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-[#1a2332] placeholder-[#6b7280] focus:outline-none focus:border-brand-primary transition text-left font-mono shadow-sm"
                  />
                  <span className="text-sm font-bold text-brand-helper whitespace-nowrap">{currencyLabel}</span>
                </div>
              </div>

              {/* Entertainment */}
              <div className="space-y-2">
                <label className="text-xs text-[#1a2332] font-bold block">{t("wizard_label_entertainment")}</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    placeholder={isRtl ? "المطاعم والترفيه - مثال: 800" : "Entertainment - e.g. 800"}
                    value={entertainment}
                    onChange={(e) => setEntertainment(e.target.value === "" ? "" : Math.max(0, parseInt(e.target.value) || 0))}
                    className="flex-1 w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-[#1a2332] placeholder-[#6b7280] focus:outline-none focus:border-brand-primary transition text-left font-mono shadow-sm"
                  />
                  <span className="text-sm font-bold text-brand-helper whitespace-nowrap">{currencyLabel}</span>
                </div>
              </div>

              {/* Family visits & gifts */}
              <div className="space-y-2">
                <label className="text-xs text-[#1a2332] font-bold block">{t("wizard_label_family")}</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    placeholder={isRtl ? "الهدايا والموجبات - مثال: 300" : "Family visits & gifts - e.g. 300"}
                    value={family}
                    onChange={(e) => setFamily(e.target.value === "" ? "" : Math.max(0, parseInt(e.target.value) || 0))}
                    className="flex-1 w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-[#1a2332] placeholder-[#6b7280] focus:outline-none focus:border-brand-primary transition text-left font-mono shadow-sm"
                  />
                  <span className="text-sm font-bold text-brand-helper whitespace-nowrap">{currencyLabel}</span>
                </div>
              </div>

              {/* Clothing */}
              <div className="space-y-2">
                <label className="text-xs text-[#1a2332] font-bold block">{t("wizard_label_clothing")}</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    placeholder={isRtl ? "الملابس والكسوة - مثال: 400" : "Clothing - e.g. 400"}
                    value={clothing}
                    onChange={(e) => setClothing(e.target.value === "" ? "" : Math.max(0, parseInt(e.target.value) || 0))}
                    className="flex-1 w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-[#1a2332] placeholder-[#6b7280] focus:outline-none focus:border-brand-primary transition text-left font-mono shadow-sm"
                  />
                  <span className="text-sm font-bold text-brand-helper whitespace-nowrap">{currencyLabel}</span>
                </div>
              </div>

              {/* Healthcare */}
              <div className="space-y-2">
                <label className="text-xs text-[#1a2332] font-bold block">{t("wizard_label_healthcare")}</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    placeholder={isRtl ? "العلاج والأدوية - مثال: 300" : "Healthcare - e.g. 300"}
                    value={healthcare}
                    onChange={(e) => setHealthcare(e.target.value === "" ? "" : Math.max(0, parseInt(e.target.value) || 0))}
                    className="flex-1 w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-[#1a2332] placeholder-[#6b7280] focus:outline-none focus:border-brand-primary transition text-left font-mono shadow-sm"
                  />
                  <span className="text-sm font-bold text-brand-helper whitespace-nowrap">{currencyLabel}</span>
                </div>
              </div>

              {/* Misc */}
              <div className="space-y-2">
                <label className="text-xs text-[#1a2332] font-bold block">{t("wizard_label_misc")}</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    placeholder={isRtl ? "مصاريف أخرى - مثال: 600" : "Miscellaneous - e.g. 600"}
                    value={misc}
                    onChange={(e) => setMisc(e.target.value === "" ? "" : Math.max(0, parseInt(e.target.value) || 0))}
                    className="flex-1 w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-[#1a2332] placeholder-[#6b7280] focus:outline-none focus:border-brand-primary transition text-left font-mono shadow-sm"
                  />
                  <span className="text-sm font-bold text-brand-helper whitespace-nowrap">{currencyLabel}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Goals & Savings */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-brand-primary" />
              <h3 className="text-lg font-bold text-[#1a2332]">{t("wizard_step_4_header")}</h3>
            </div>

            <div className="space-y-5">
              {/* Core Current Savings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs text-[#1a2332] font-bold block">{t("wizard_label_current_savings")}</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      placeholder={isRtl ? "الادخار المتوفر الحالي - مثال: 10000" : "Current savings - e.g. 10000"}
                      value={currentSavings}
                      onChange={(e) => setCurrentSavings(e.target.value === "" ? "" : Math.max(0, parseInt(e.target.value) || 0))}
                      className="flex-1 w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-[#1a2332] placeholder-[#6b7280] focus:outline-none focus:border-brand-primary transition text-left font-mono shadow-sm"
                    />
                    <span className="text-sm font-bold text-brand-helper whitespace-nowrap">{currencyLabel}</span>
                </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-[#1a2332] font-bold block flex items-center gap-1">
                    <span>{t("wizard_label_emergency_target")}</span>
                    <span className="text-[10px] text-brand-helper font-normal">{t("wizard_emergency_target_note")}</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      placeholder={isRtl ? "صندوق الطوارئ المستهدف - مثال: 60000" : "Emergency target - e.g. 60000"}
                      value={emergencyTarget}
                      onChange={(e) => setEmergencyTarget(e.target.value === "" ? "" : Math.max(0, parseInt(e.target.value) || 0))}
                      className="flex-1 w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-[#1a2332] placeholder-[#6b7280] focus:outline-none focus:border-brand-primary transition text-left font-mono shadow-sm"
                    />
                    <span className="text-sm font-bold text-brand-helper whitespace-nowrap">{currencyLabel}</span>
                </div>
                </div>
              </div>

              {/* Short Term Goal inputs */}
              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3 shadow-sm">
                <div className="flex items-center gap-1.5 text-xs font-black text-[#1a2332]">
                  <TrendingUp className="w-4 h-4 text-emerald-600 animate-pulse" />
                  <span>{t("wizard_short_goal_title")}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder={t("wizard_placeholder_short_goal")}
                    value={shortGoalName}
                    onChange={(e) => setShortGoalName(e.target.value)}
                    className={`bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#1a2332] placeholder-[#6b7280] focus:outline-none focus:border-brand-primary ${textDir}`}
                  />
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      placeholder={t("wizard_placeholder_amount") + (isRtl ? " - مثال: 15000" : " - e.g. 15000")}
                      value={shortGoalTarget}
                      onChange={(e) => setShortGoalTarget(e.target.value === "" ? "" : Math.max(0, parseInt(e.target.value) || 0))}
                      className={`flex-1 w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#1a2332] placeholder-[#6b7280] focus:outline-none focus:border-brand-primary text-left font-mono ${textDir}`}
                    />
                    <span className="text-sm font-bold text-brand-helper whitespace-nowrap">{currencyLabel}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      placeholder={t("wizard_placeholder_months") + (isRtl ? " - مثال: 6" : " - e.g. 6")}
                      value={shortGoalMonths}
                      onChange={(e) => setShortGoalMonths(e.target.value === "" ? "" : Math.max(1, parseInt(e.target.value) || 0))}
                      className={`flex-1 w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#1a2332] placeholder-[#6b7280] focus:outline-none focus:border-brand-primary text-left font-mono ${textDir}`}
                    />
                    <span className="text-sm font-bold text-brand-helper whitespace-nowrap">{isRtl ? "شهر" : "Months"}</span>
                  </div>
                </div>
              </div>

              {/* Long Term Goal inputs */}
              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3 shadow-sm">
                <div className="flex items-center gap-1.5 text-xs font-black text-[#1a2332]">
                  <TrendingUp className="w-4 h-4 text-brand-primary animate-pulse" />
                  <span>{t("wizard_long_goal_title")}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder={t("wizard_placeholder_long_goal")}
                    value={longGoalName}
                    onChange={(e) => setLongGoalName(e.target.value)}
                    className={`bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#1a2332] placeholder-[#6b7280] focus:outline-none focus:border-brand-primary ${textDir}`}
                  />
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      placeholder={t("wizard_placeholder_amount") + (isRtl ? " - مثال: 200000" : " - e.g. 200000")}
                      value={longGoalTarget}
                      onChange={(e) => setLongGoalTarget(e.target.value === "" ? "" : Math.max(0, parseInt(e.target.value) || 0))}
                      className={`flex-1 w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#1a2332] placeholder-[#6b7280] focus:outline-none focus:border-brand-primary text-left font-mono ${textDir}`}
                    />
                    <span className="text-sm font-bold text-brand-helper whitespace-nowrap">{currencyLabel}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      placeholder={t("wizard_placeholder_months") + (isRtl ? " - مثال: 36" : " - e.g. 36")}
                      value={longGoalMonths}
                      onChange={(e) => setLongGoalMonths(e.target.value === "" ? "" : Math.max(1, parseInt(e.target.value) || 0))}
                      className={`flex-1 w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#1a2332] placeholder-[#6b7280] focus:outline-none focus:border-brand-primary text-left font-mono ${textDir}`}
                    />
                    <span className="text-sm font-bold text-brand-helper whitespace-nowrap">{isRtl ? "شهر" : "Months"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER ACTIONS */}
      <div className="flex items-center justify-between border-t border-slate-100 pt-6">
        {step > 1 ? (
          <button
            onClick={handleBack}
            disabled={loading}
            className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-brand-text-light font-bold text-xs rounded-xl flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
          >
            {isRtl ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
            <span>{t("wizard_btn_prev")}</span>
          </button>
        ) : (
          <div></div>
        )}

        {step < 4 ? (
          <button
            onClick={handleNext}
            className="px-6 py-2.5 bg-brand-primary hover:bg-opacity-95 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition cursor-pointer shadow-lg shadow-brand-primary/10"
          >
            <span>{t("wizard_btn_next")}</span>
            {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm rounded-xl flex items-center gap-2 transition cursor-pointer shadow-lg shadow-emerald-600/20 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            <span>{t("wizard_btn_save")}</span>
          </button>
        )}
      </div>
    </div>
  );
}
