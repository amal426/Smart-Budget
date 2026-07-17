import React from "react";
import { FullProfile } from "../types";
import { Award, ShieldAlert, Sparkles, Compass, Calendar } from "lucide-react";
import { t, getLanguage, formatCurrency, localizeValue } from "../lib/translations";

interface GoalsTrackerProps {
  currentProfile: FullProfile;
}

export const GoalsTracker: React.FC<GoalsTrackerProps> = ({ currentProfile }) => {
  const { savingsPlan, financialGoals, monthlyExpenses } = currentProfile;
  const lang = getLanguage();
  const isRtl = lang === "ar";
  const textDir = isRtl ? "text-right" : "text-left";

  // Emergency Fund Details
  const currentSavings = savingsPlan.currentSavings;
  const emergencyTarget = savingsPlan.emergencyFundTarget;
  const emergencyProgress = Math.min(100, Math.round((currentSavings / emergencyTarget) * 100));
  const monthsOfExpensesCovered = (currentSavings / monthlyExpenses.totalExpenses).toFixed(1);

  // Tip translations
  const tipTitle = isRtl
    ? 'نصيحة مستشارك المالي "Smart Budget" لليوم:'
    : 'Your "Smart Budget" advisor tip for today:';
  
  const tipBody = isRtl
    ? `قاعدة الذهب في الادخار هي "ادخر قبل أن تبدأ بالصرف". بمجرد استلام الراتب، قم بتحويل مبلغ الادخار الشهري (${formatCurrency(savingsPlan.monthlySavings)}) مباشرة إلى حساب طوارئ أو استثمار منفصل قبل البدء في توزيع النفقات الاختيارية. هذا يمنع النفقات العشوائية ويضمن تقدمك الثابت نحو أهدافك المالية.`
    : `The golden rule of saving is "Save before you start spending". As soon as you receive your salary, transfer the monthly savings amount (${formatCurrency(savingsPlan.monthlySavings)}) directly to a separate emergency or investment account before allocating discretionary expenses. This prevents random spending and ensures steady progress towards your financial goals.`;

  return (
    <div className={`space-y-6 ${textDir}`} dir={isRtl ? "rtl" : "ltr"}>
      {/* Emergency Fund Card */}
      <div className="bg-brand-light border border-brand-secondary/15 rounded-2xl p-6 text-brand-text-light shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-amber-500/10 text-amber-500 rounded-lg">
                <ShieldAlert className="w-5 h-5" />
              </span>
              <h4 className="text-xl font-bold text-brand-text-light">{t("emergency_fund_title")}</h4>
            </div>
            <p className="text-sm text-brand-helper font-medium">
              {t("emergency_fund_desc", { months: savingsPlan.emergencyFundMonths })}
            </p>
          </div>
          <div className={isRtl ? "text-left md:text-right" : "text-right md:text-left"}>
            <span className="text-xs text-brand-helper font-bold">{t("current_savings_title")}</span>
            <p className="text-2xl font-black text-amber-500 font-mono">
              {currentSavings.toLocaleString()} / {emergencyTarget.toLocaleString()} <span className="text-xs text-brand-text-light">{isRtl ? "ريال" : "SAR"}</span>
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-brand-text-light font-bold">
            <span>{t("emergency_coverage_ratio")}</span>
            <span className="font-mono text-amber-500 font-black">{emergencyProgress}%</span>
          </div>
          <div className="h-4 bg-brand-dark rounded-full overflow-hidden p-1 border border-brand-secondary/10">
            <div
              className="h-full rounded-full bg-amber-500 transition-all duration-500"
              style={{ width: `${emergencyProgress}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-brand-helper font-bold pt-1">
            <span>{t("emergency_coverage_status", { months: monthsOfExpensesCovered })}</span>
            <span>{t("emergency_target_label", { months: savingsPlan.emergencyFundMonths })}</span>
          </div>
        </div>
      </div>

      {/* Financial Goals Grid */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <span className="p-1.5 bg-brand-primary/10 text-brand-primary rounded-lg">
            <Compass className="w-5 h-5" />
          </span>
          <h4 className="text-xl font-bold text-brand-text-light">{t("planned_goals_title")}</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {financialGoals.map((goal, index) => {
            const monthlySavingsCapacity = savingsPlan.monthlySavings;
            const canAffordGoal = monthlySavingsCapacity >= goal.monthlyNeeded;
            const progressPercentage = Math.min(100, Math.round((currentSavings / goal.targetAmount) * 100));

            return (
              <div
                key={goal.goal}
                className="bg-brand-light border border-brand-secondary/15 rounded-2xl p-5 text-brand-text-light flex flex-col justify-between hover:shadow-lg transition duration-300 relative overflow-hidden shadow-md"
              >
                {/* Decorative background circle */}
                <div className="absolute -top-10 -left-10 w-24 h-24 bg-brand-primary/5 rounded-full blur-xl pointer-events-none"></div>

                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
                      {t("goal_label", { number: index + 1 })}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-brand-helper font-bold">
                      <Calendar className="w-3.5 h-3.5" /> {t("months_label", { months: goal.timelineMonths })}
                    </span>
                  </div>

                  <h5 className="font-bold text-lg text-brand-text-light">{localizeValue(goal.goal)}</h5>

                  <div className="space-y-1">
                    <span className="text-xs text-brand-helper font-bold">{t("target_amount_label")}</span>
                    <p className="text-xl font-black text-brand-text-light font-mono">
                      {formatCurrency(goal.targetAmount)}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-brand-secondary/10 mt-4">
                  <div className="flex justify-between text-xs">
                    <span className="text-brand-helper font-bold">{t("monthly_savings_needed")}:</span>
                    <strong className="text-brand-primary font-black font-mono">{formatCurrency(goal.monthlyNeeded)}</strong>
                  </div>

                  {/* Feasibility Indicator */}
                  <div className="flex items-center gap-1.5 text-xs">
                    {canAffordGoal ? (
                      <span className="inline-flex items-center gap-1 text-brand-success bg-brand-success/10 px-2 py-0.5 rounded-md font-bold">
                        <Sparkles className="w-3.5 h-3.5" /> {t("affordable_goal")}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md font-bold">
                        <ShieldAlert className="w-3.5 h-3.5" /> {t("unaffordable_goal", { needed: (goal.monthlyNeeded - monthlySavingsCapacity).toLocaleString() })}
                      </span>
                    )}
                  </div>

                  {/* Goal progress indicator based on current savings */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-brand-helper font-bold">
                      <span>{t("emergency_coverage_ratio")}</span>
                      <span className="font-mono">{progressPercentage}%</span>
                    </div>
                    <div className="h-1.5 bg-brand-dark rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-primary rounded-full transition-all duration-500"
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Financial Health Tip */}
      <div className="bg-brand-light border border-brand-secondary/15 rounded-2xl p-5 text-brand-text-light shadow-md">
        <h5 className="font-bold text-sm text-brand-primary mb-1 flex items-center gap-1">
          <Award className="w-4 h-4 text-brand-primary animate-pulse" /> {tipTitle}
        </h5>
        <p className="text-xs text-brand-text-light leading-relaxed font-medium">
          {tipBody}
        </p>
      </div>
    </div>
  );
};
