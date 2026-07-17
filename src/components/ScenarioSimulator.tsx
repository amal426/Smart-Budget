import React, { useState } from "react";
import { FullProfile } from "../types";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, Coins } from "lucide-react";
import { t, getLanguage, formatCurrency, localizeValue } from "../lib/translations";

interface ScenarioSimulatorProps {
  currentProfile: FullProfile;
}

export const ScenarioSimulator: React.FC<ScenarioSimulatorProps> = ({ currentProfile }) => {
  const { simulationScenarios, savingsPlan } = currentProfile;
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState<number>(0);
  const [customMonthlySavings, setCustomMonthlySavings] = useState<number>(savingsPlan.monthlySavings);
  const [customReturnRate, setCustomReturnRate] = useState<number>(0); // Annual interest/return rate in %

  const lang = getLanguage();
  const isRtl = lang === "ar";
  const textDir = isRtl ? "text-right" : "text-left";
  const customBudgetLegend = t("custom_budget_legend");

  const activeScenario = simulationScenarios[selectedScenarioIndex];

  // Generate dynamic chart data for comparison over 20 years
  const years = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 16, 18, 20];

  const chartData = years.map((year) => {
    const dataPoint: any = { year: t("chart_year_label", { year }) };

    simulationScenarios.forEach((sc) => {
      let total = savingsPlan.currentSavings;
      const monthly = sc.monthlySavings;
      const rate = sc.investmentReturn || 0;

      if (rate > 0) {
        const monthlyRate = rate / 12;
        const totalMonths = year * 12;
        if (totalMonths > 0) {
          total =
            savingsPlan.currentSavings * Math.pow(1 + monthlyRate, totalMonths) +
            monthly * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) * (1 + monthlyRate);
        }
      } else {
        total += monthly * 12 * year;
      }

      dataPoint[sc.scenarioName] = Math.round(total);
    });

    // Add custom scenario to chart
    let customTotal = savingsPlan.currentSavings;
    const rate = customReturnRate / 100;
    if (rate > 0) {
      const monthlyRate = rate / 12;
      const totalMonths = year * 12;
      if (totalMonths > 0) {
        customTotal =
          savingsPlan.currentSavings * Math.pow(1 + monthlyRate, totalMonths) +
          customMonthlySavings * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) * (1 + monthlyRate);
      }
    } else {
      customTotal += customMonthlySavings * 12 * year;
    }
    dataPoint[customBudgetLegend] = Math.round(customTotal);

    return dataPoint;
  });

  return (
    <div className={`space-y-6 ${textDir}`} dir={isRtl ? "rtl" : "ltr"}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Selection & Details Side */}
        <div className="lg:col-span-4 space-y-4">
          <div>
            <h4 className="text-lg font-bold text-brand-text-light">{t("scenarios_simulator_title")}</h4>
            <p className="text-xs text-brand-helper">{t("scenarios_simulator_desc")}</p>
          </div>

          {/* Scenario Buttons */}
          <div className="space-y-3">
            {simulationScenarios.map((sc, index) => {
              const isActive = selectedScenarioIndex === index;
              return (
                <button
                  key={sc.scenarioName}
                  onClick={() => {
                    setSelectedScenarioIndex(index);
                    setCustomMonthlySavings(sc.monthlySavings);
                    setCustomReturnRate(sc.investmentReturn ? sc.investmentReturn * 100 : 0);
                  }}
                  className={`w-full ${textDir} p-4 rounded-xl border transition duration-300 flex flex-col gap-1.5 cursor-pointer ${
                    isActive
                      ? "bg-brand-primary/10 border-brand-primary text-brand-text-light shadow-sm"
                      : "bg-brand-light border-brand-secondary/15 text-brand-text-light hover:border-brand-primary/40"
                  }`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="font-bold text-sm text-brand-text-light">{localizeValue(sc.scenarioName)}</span>
                    <span className="font-mono text-xs text-brand-primary font-bold bg-brand-primary/10 px-2.5 py-0.5 rounded-full">
                      {t("scenario_savings_rate", { amount: sc.monthlySavings.toLocaleString() })}
                    </span>
                  </div>
                  <p className="text-xs text-brand-helper font-semibold leading-relaxed">{localizeValue(sc.notes)}</p>
                </button>
              );
            })}
          </div>

          {/* Scenario Analysis Output */}
          <div className="bg-brand-light border border-brand-secondary/15 rounded-2xl p-4 text-brand-text-light space-y-3.5 shadow-md">
            <h5 className="font-bold text-sm text-brand-text-light">{t("scenario_analysis_title")}</h5>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-brand-dark/40 border border-brand-secondary/10 rounded-xl">
                <span className="text-[11px] text-brand-helper font-bold block">{t("accumulation_10_years")}</span>
                <strong className="text-base font-black text-brand-primary font-mono">
                  {formatCurrency(activeScenario.projected10Years)}
                </strong>
              </div>
              <div className="p-3 bg-brand-dark/40 border border-brand-secondary/10 rounded-xl">
                <span className="text-[11px] text-brand-helper font-bold block">{t("accumulation_20_years")}</span>
                <strong className="text-base font-black text-brand-success font-mono">
                  {formatCurrency(activeScenario.projected20Years)}
                </strong>
              </div>
            </div>
            {activeScenario.loanAmount && (
              <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl text-xs space-y-1">
                <p className="font-bold text-red-500">{t("loan_details_title")}</p>
                <div className="grid grid-cols-2 text-brand-text-light gap-1 mt-1 font-mono">
                  <span>{t("loan_amount_label", { amount: formatCurrency(activeScenario.loanAmount) })}</span>
                  <span>{t("loan_interest_label", { rate: ((activeScenario.loanInterest || 0) * 100).toFixed(0) })}</span>
                  <span>{t("loan_term_label", { months: activeScenario.loanTermMonths })}</span>
                  <span className="text-red-500 font-bold">{t("loan_payment_label", { payment: formatCurrency(activeScenario.monthlyPayment || 0) })}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Projections Chart */}
        <div className="lg:col-span-8 bg-brand-light border border-brand-secondary/15 rounded-2xl p-5 text-brand-text-light shadow-md flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-lg font-bold text-brand-text-light">{t("savings_growth_title")}</h4>
                <p className="text-xs text-brand-helper font-semibold">{t("savings_growth_desc")}</p>
              </div>
              <div className="flex items-center gap-1 text-xs text-brand-primary bg-brand-primary/10 px-3 py-1 rounded-full font-bold">
                <TrendingUp className="w-4 h-4" /> {t("compound_interest_badge")}
              </div>
            </div>
          </div>

          <div className="h-72 mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSelected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c87941" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#c87941" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorCustom" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#27ae60" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#27ae60" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--btn-secondary)" strokeOpacity={0.15} />
                <XAxis dataKey="year" stroke="#a0aec0" style={{ fontSize: "11px", fontWeight: "bold" }} />
                <YAxis
                  stroke="#a0aec0"
                  style={{ fontSize: "11px", fontWeight: "bold" }}
                  tickFormatter={(value) => isRtl ? `${(value / 1000).toLocaleString()} ألف` : `${(value / 1000).toLocaleString()}k`}
                />
                <Tooltip
                  formatter={(value: any) => [formatCurrency(value), t("savings_growth_chart_legend")]}
                  contentStyle={{
                    backgroundColor: "var(--bg-card)",
                    borderColor: "var(--btn-secondary)",
                    color: "var(--text-primary)",
                    borderRadius: "12px",
                    textAlign: isRtl ? "right" : "left"
                  }}
                />
                <Legend style={{ fontSize: "12px", fontWeight: "bold" }} />

                <Area
                  type="monotone"
                  name={localizeValue(activeScenario.scenarioName)}
                  dataKey={activeScenario.scenarioName}
                  stroke="#c87941"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorSelected)"
                />

                <Area
                  type="monotone"
                  name={customBudgetLegend}
                  dataKey={customBudgetLegend}
                  stroke="#27ae60"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorCustom)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className={`text-[11px] text-brand-helper font-bold mt-2 ${textDir}`}>
            {t("simulation_disclaimer", { balance: formatCurrency(savingsPlan.currentSavings) })}
          </div>
        </div>
      </div>

      {/* Dynamic Simulation Form */}
      <div className="bg-brand-light border border-brand-secondary/15 rounded-2xl p-5 text-brand-text-light shadow-md">
        <div className="flex items-center gap-2 mb-4">
          <span className="p-1 bg-brand-primary/10 text-brand-primary rounded">
            <Coins className="w-4 h-4" />
          </span>
          <h5 className="font-bold text-base text-brand-text-light">{t("adjust_parameters_title")}</h5>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-xs text-brand-text-light font-bold">{t("custom_monthly_savings_label")}</label>
              <span className="text-xs font-black font-mono text-brand-primary">{formatCurrency(customMonthlySavings)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="20000"
              step="100"
              value={customMonthlySavings}
              onChange={(e) => setCustomMonthlySavings(Number(e.target.value))}
              className="w-full h-1.5 bg-brand-dark rounded-lg appearance-none cursor-pointer accent-brand-primary"
            />
            <div className="flex justify-between text-[10px] text-brand-helper font-bold font-mono">
              <span>{formatCurrency(0)}</span>
              <span>{formatCurrency(10000)}</span>
              <span>{formatCurrency(20000)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-xs text-brand-text-light font-bold">{t("investment_return_rate")}</label>
              <span className="text-xs font-black font-mono text-brand-success">{customReturnRate}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="15"
              step="0.5"
              value={customReturnRate}
              onChange={(e) => setCustomReturnRate(Number(e.target.value))}
              className="w-full h-1.5 bg-brand-dark rounded-lg appearance-none cursor-pointer accent-brand-success"
            />
            <div className="flex justify-between text-[10px] text-brand-helper font-bold font-mono">
              <span>0% - {t("simulation_param_cash")}</span>
              <span>7% - {t("simulation_param_avg")}</span>
              <span>15% - {t("simulation_param_high")}</span>
            </div>
          </div>
        </div>

        {/* Dynamic calculations explainer */}
        <div className={`mt-4 pt-4 border-t border-brand-secondary/10 text-xs text-brand-helper font-semibold leading-relaxed flex flex-col md:flex-row md:items-center justify-between gap-4 bg-brand-dark/40 p-4 rounded-xl ${textDir}`}>
          <div>
            <span className="font-bold text-brand-text-light">{t("simulation_explainer_title")}</span>{" "}
            {customReturnRate > 0 ? (
              <span>
                {t("simulation_compounding_formula")}
              </span>
            ) : (
              <span>
                {t("simulation_simple_formula", { balance: formatCurrency(savingsPlan.currentSavings) })}
              </span>
            )}
          </div>
          <div className="shrink-0 bg-brand-success/10 text-brand-success px-4 py-2 rounded-xl border border-brand-success/20 font-bold">
            {t("simulation_custom_accum_title")}{" "}
            <strong className="text-sm font-black font-mono text-brand-success">
              {formatCurrency(
                Math.round(
                  customReturnRate > 0
                    ? savingsPlan.currentSavings * Math.pow(1 + customReturnRate / 100 / 12, 120) +
                        customMonthlySavings *
                          ((Math.pow(1 + customReturnRate / 100 / 12, 120) - 1) / (customReturnRate / 100 / 12)) *
                          (1 + customReturnRate / 100 / 12)
                    : savingsPlan.currentSavings + customMonthlySavings * 120
                )
              )}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
};
