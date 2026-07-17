export interface UserProfile {
  name: string;
  age: number;
  maritalStatus: string;
  childrenCount: number;
  childrenAges?: number[];
  city: string;
  jobTitle: string;
  spouseWorks?: boolean;
  spouseJob?: string;
  education: string;
  businessType?: string;
  businessExperienceYears?: number;
}

export interface Deductions {
  gosiEmployee: number;
  incomeTax: number;
  healthInsurance: number;
  other: number;
}

export interface MonthlyIncome {
  primarySalary?: number;
  spouseSalary?: number;
  housingAllowance?: number;
  transportAllowance?: number;
  bonusesAverage?: number;
  businessRevenue?: number;
  businessCosts?: number;
  netBusinessIncome?: number;
  otherIncome?: number;
  totalGross?: number;
  deductions?: Deductions;
  netIncome: number;
  incomeVolatility?: string;
}

export interface MonthlyExpenses {
  housingRentOrMortgage: number;
  utilities: number;
  foodGroceries: number;
  childrenEducation: number;
  transportation: number;
  healthcare: number;
  phoneInternet: number;
  entertainment: number;
  clothing: number;
  familyVisits: number;
  debtPayments: number;
  miscellaneous: number;
  businessOperational?: number;
  marketing?: number;
  emergencyReserve?: number;
  totalExpenses: number;
}

export interface SavingsPlan {
  emergencyFundTarget: number;
  emergencyFundMonths: number;
  monthlySavings: number;
  savingsRate: number;
  currentSavings: number;
  investmentPreference: string;
  retirementPlan?: string;
  businessReinvestment?: number;
}

export interface FinancialGoal {
  goal: string;
  targetAmount: number;
  timelineMonths: number;
  monthlyNeeded: number;
}

export interface SimulationScenario {
  scenarioName: string;
  monthlySavings: number;
  projected5Years?: number;
  projected10Years: number;
  projected20Years: number;
  notes: string;
  investmentReturn?: number;
  loanAmount?: number;
  loanInterest?: number;
  loanTermMonths?: number;
  monthlyPayment?: number;
}

export interface FullProfile {
  id: string;
  profile: UserProfile;
  monthlyIncome: MonthlyIncome;
  monthlyExpenses: MonthlyExpenses;
  savingsPlan: SavingsPlan;
  financialGoals: FinancialGoal[];
  simulationScenarios: SimulationScenario[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}
