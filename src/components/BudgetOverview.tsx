import React from "react";
import { FullProfile } from "../types";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { ArrowUpRight, ArrowDownRight, Percent } from "lucide-react";
import { t, getLanguage, formatCurrency } from "../lib/translations";

interface BudgetOverviewProps {
  currentProfile: FullProfile;
}

const COLORS = [
  "#c87941", // Brand Primary (Bronze)
  "#2c3e50", // Brand Secondary (Dark Slate)
  "#10B981", // Emerald
  "#3B82F6", // Blue
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#14B8A6", // Teal
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#F43F5E", // Rose
  "#06B6D4", // Cyan
  "#64748B", // Slate
];

export const BudgetOverview: React.FC<BudgetOverviewProps> = ({ currentProfile }) => {
  const { monthlyIncome, monthlyExpenses } = currentProfile;
  const lang = getLanguage();
  const isRtl = lang === "ar";
  const textDir = isRtl ? "text-right" : "text-left";

  // Prepare expense data for Recharts Pie with translated category names
  const expenseData = [
    { name: t("cat_housingRentOrMortgage"), value: monthlyExpenses.housingRentOrMortgage },
    { name: t("cat_utilities"), value: monthlyExpenses.utilities },
    { name: t("cat_foodGroceries"), value: monthlyExpenses.foodGroceries },
    { name: t("cat_childrenEducation"), value: monthlyExpenses.childrenEducation },
    { name: t("cat_transportation"), value: monthlyExpenses.transportation },
    { name: t("cat_healthcare"), value: monthlyExpenses.healthcare },
    { name: t("cat_phoneInternet"), value: monthlyExpenses.phoneInternet },
    { name: t("cat_entertainment"), value: monthlyExpenses.entertainment },
    { name: t("cat_clothing"), value: monthlyExpenses.clothing },
    { name: t("cat_familyVisits"), value: monthlyExpenses.familyVisits },
    { name: t("cat_debtPayments"), value: monthlyExpenses.debtPayments },
    { name: t("cat_miscellaneous"), value: monthlyExpenses.miscellaneous },
  ].filter((item) => item.value > 0);

  // Add Business operational & marketing expenses if present
  if (monthlyExpenses.businessOperational && monthlyExpenses.businessOperational > 0) {
    expenseData.push({ name: t("cat_businessOperational"), value: monthlyExpenses.businessOperational });
  }
  if (monthlyExpenses.marketing && monthlyExpenses.marketing > 0) {
    expenseData.push({ name: t("cat_marketing"), value: monthlyExpenses.marketing });
  }

  // Calculate percentages
  const totalNet = monthlyIncome.netIncome;
  const totalExp = monthlyExpenses.totalExpenses;
  const remainingSavings = Math.max(0, totalNet - totalExp);
  const expensePercent = Math.round((totalExp / totalNet) * 100);
  const savingsPercent = Math.round((remainingSavings / totalNet) * 100);

  return (
    <div className={`space-y-6 ${textDir}`} dir={lang === "ar" ? "rtl" : "ltr"}>
      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Income Card */}
        <div className="bg-brand-light border border-brand-secondary/15 rounded-2xl p-5 text-brand-text-light shadow-md flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-brand-helper text-sm font-bold">{t("net_monthly_income")}</p>
            <h3 className="text-3xl font-black tracking-tight font-mono text-brand-success">
              {formatCurrency(totalNet)}
            </h3>
            {monthlyIncome.incomeVolatility && (
              <span className="inline-flex items-center gap-1 text-[11px] bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full font-bold">
                {monthlyIncome.incomeVolatility}
              </span>
            )}
          </div>
          <div className="p-3 bg-brand-success/10 rounded-xl text-brand-success">
            <ArrowUpRight className="w-6 h-6" />
          </div>
        </div>
 
        {/* Expenses Card */}
        <div className="bg-brand-light border border-brand-secondary/15 rounded-2xl p-5 text-brand-text-light shadow-md flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-brand-helper text-sm font-bold">{t("total_expenses")}</p>
            <h3 className="text-3xl font-black tracking-tight font-mono text-red-600">
              {formatCurrency(totalExp)}
            </h3>
            <p className="text-xs text-red-700/80 font-medium">
              {t("expense_ratio", { percent: expensePercent })}
            </p>
          </div>
          <div className="p-3 bg-red-500/10 rounded-xl text-red-500">
            <ArrowDownRight className="w-6 h-6" />
          </div>
        </div>
 
        {/* Savings Capacity Card */}
        <div className="bg-brand-light border border-brand-secondary/15 rounded-2xl p-5 text-brand-text-light shadow-md flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-brand-helper text-sm font-bold">{t("savings_capacity")}</p>
            <h3 className="text-3xl font-black tracking-tight font-mono text-brand-primary">
              {formatCurrency(remainingSavings)}
            </h3>
            <p className="text-xs text-brand-primary/80 font-medium">
              {t("savings_rate_label", { percent: savingsPercent })}
            </p>
          </div>
          <div className="p-3 bg-brand-primary/10 rounded-xl text-brand-primary">
            <Percent className="w-6 h-6" />
          </div>
        </div>
      </div>
 
      {/* Gross Income Breakdown and Deductions */}
      {monthlyIncome.totalGross && monthlyIncome.deductions && (
        <div className="bg-brand-light border border-brand-secondary/15 rounded-2xl p-5 text-brand-text-light shadow-md">
          <h4 className="text-lg font-bold mb-4 text-brand-text-light">{t("gosi_section_title")}</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-brand-dark/40 rounded-xl border border-brand-secondary/10">
              <span className="text-xs text-brand-helper font-bold">{t("gross_salary_before")}</span>
              <p className="text-lg font-black text-brand-text-light mt-1 font-mono">{formatCurrency(monthlyIncome.totalGross)}</p>
            </div>
            {monthlyIncome.deductions.gosiEmployee > 0 && (
              <div className="p-3 bg-red-500/5 rounded-xl border border-red-500/10">
                <span className="text-xs text-red-500 font-bold">{t("gosi_deduction")}</span>
                <p className="text-lg font-black text-red-500 mt-1 font-mono">-{formatCurrency(monthlyIncome.deductions.gosiEmployee)}</p>
              </div>
            )}
            {monthlyIncome.deductions.incomeTax > 0 && (
              <div className="p-3 bg-red-500/5 rounded-xl border border-red-500/10">
                <span className="text-xs text-red-500 font-bold">{t("gosi_tax")}</span>
                <p className="text-lg font-black text-red-500 mt-1 font-mono">-{formatCurrency(monthlyIncome.deductions.incomeTax)}</p>
              </div>
            )}
            {monthlyIncome.deductions.healthInsurance > 0 && (
              <div className="p-3 bg-red-500/5 rounded-xl border border-red-500/10">
                <span className="text-xs text-red-500 font-bold">{t("gosi_health")}</span>
                <p className="text-lg font-black text-red-500 mt-1 font-mono">-{formatCurrency(monthlyIncome.deductions.healthInsurance)}</p>
              </div>
            )}
          </div>
        </div>
      )}
 
      {/* Expense Chart & Details Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recharts Pie Chart */}
        <div className="bg-brand-light border border-brand-secondary/15 rounded-2xl p-5 text-brand-text-light shadow-md lg:col-span-5 flex flex-col justify-between">
          <div>
            <h4 className="text-lg font-bold text-brand-text-light">{t("monthly_expense_analysis")}</h4>
            <p className="text-xs text-brand-helper">{t("expense_distribution_sub")}</p>
          </div>
          <div className="h-64 mt-4 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {expenseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [formatCurrency(value), t("amount_label")]}
                  contentStyle={{
                    backgroundColor: "var(--bg-card)",
                    borderColor: "var(--btn-secondary)",
                    color: "var(--text-primary)",
                    borderRadius: "12px",
                    textAlign: isRtl ? "right" : "left",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <span className="text-xs text-brand-helper font-bold">{t("total_spending_label")}</span>
              <p className="text-lg font-black text-red-500 font-mono">{formatCurrency(totalExp)}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
            {expenseData.slice(0, 6).map((item, index) => (
              <div key={item.name} className="flex items-center gap-1.5 text-brand-text-light font-medium">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                <span className="truncate">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
 
        {/* Expense Progress Bars */}
        <div className="bg-brand-light border border-brand-secondary/15 rounded-2xl p-5 text-brand-text-light shadow-md lg:col-span-7">
          <h4 className="text-lg font-bold mb-4 text-brand-text-light">{t("budget_items_distribution")}</h4>
          <div className="space-y-4 max-h-[360px] overflow-y-auto pr-2 custom-scrollbar">
            {expenseData.map((item, index) => {
              const itemPercent = ((item.value / totalNet) * 100).toFixed(1);
              return (
                <div key={item.name} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-brand-text-light font-bold">{item.name}</span>
                    <span className="text-brand-helper font-semibold font-mono">
                      {formatCurrency(item.value)} - {itemPercent}%
                    </span>
                  </div>
                  <div className="h-2 bg-brand-dark rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        backgroundColor: COLORS[index % COLORS.length],
                        width: `${Math.min(100, parseFloat(itemPercent) * 3)}%`, // Scaled for visual representation
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
