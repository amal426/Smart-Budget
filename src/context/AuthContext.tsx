import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  updateProfile 
} from "firebase/auth";
import { doc, setDoc, getDoc, getDocFromServer, serverTimestamp } from "firebase/firestore";
import { auth, db, handleFirestoreError, OperationType } from "../firebase";
import { FullProfile } from "../types";

// Types for flat schema mapping to keep firestore-blueprint.json satisfied
export interface FlatProfile {
  userId: string;
  name: string;
  age: number;
  maritalStatus: string;
  city: string;
  jobTitle: string;
  netIncome: number;
  totalGross: number;
  gosi: number;
  housing: number;
  utilities: number;
  food: number;
  education: number;
  transport: number;
  health: number;
  phone: number;
  entertainment: number;
  clothing: number;
  family: number;
  debt: number;
  misc: number;
  currentSavings: number;
  emergencyTarget: number;
  createdAt?: any;
  updatedAt?: any;
}

export function toFlatProfile(userId: string, p: FullProfile): FlatProfile {
  return {
    userId,
    name: p.profile.name,
    age: p.profile.age,
    maritalStatus: p.profile.maritalStatus,
    city: p.profile.city,
    jobTitle: p.profile.jobTitle,
    netIncome: p.monthlyIncome.primarySalary || p.monthlyIncome.netIncome,
    totalGross: p.monthlyIncome.totalGross || 0,
    gosi: p.monthlyIncome.deductions?.gosiEmployee || 0,
    housing: p.monthlyExpenses.housingRentOrMortgage,
    utilities: p.monthlyExpenses.utilities,
    food: p.monthlyExpenses.foodGroceries,
    education: p.monthlyExpenses.childrenEducation,
    transport: p.monthlyExpenses.transportation,
    health: p.monthlyExpenses.healthcare,
    phone: p.monthlyExpenses.phoneInternet,
    entertainment: p.monthlyExpenses.entertainment,
    clothing: p.monthlyExpenses.clothing,
    family: p.monthlyExpenses.familyVisits,
    debt: p.monthlyExpenses.debtPayments,
    misc: p.monthlyExpenses.miscellaneous,
    currentSavings: p.savingsPlan.currentSavings,
    emergencyTarget: p.savingsPlan.emergencyFundTarget,
  };
}

export function fromFlatProfile(flat: FlatProfile): FullProfile {
  const totalExp =
    flat.housing +
    flat.utilities +
    flat.food +
    flat.education +
    flat.transport +
    flat.health +
    flat.phone +
    flat.entertainment +
    flat.clothing +
    flat.family +
    flat.debt +
    flat.misc;

  const remainingSavings = Math.max(0, flat.netIncome - totalExp);

  return {
    id: "custom",
    profile: {
      name: flat.name,
      age: flat.age,
      maritalStatus: flat.maritalStatus,
      childrenCount: flat.education > 0 ? 1 : 0,
      city: flat.city,
      jobTitle: flat.jobTitle,
      education: "جامعي",
    },
    monthlyIncome: {
      primarySalary: flat.netIncome,
      totalGross: flat.totalGross,
      deductions: {
        gosiEmployee: flat.gosi,
        incomeTax: 0,
        healthInsurance: flat.health,
        other: 0,
      },
      netIncome: flat.netIncome,
    },
    monthlyExpenses: {
      housingRentOrMortgage: flat.housing,
      utilities: flat.utilities,
      foodGroceries: flat.food,
      childrenEducation: flat.education,
      transportation: flat.transport,
      healthcare: flat.health,
      phoneInternet: flat.phone,
      entertainment: flat.entertainment,
      clothing: flat.clothing,
      familyVisits: flat.family,
      debtPayments: flat.debt,
      miscellaneous: flat.misc,
      totalExpenses: totalExp,
    },
    savingsPlan: {
      emergencyFundTarget: flat.emergencyTarget,
      emergencyFundMonths: 6,
      monthlySavings: remainingSavings,
      savingsRate: parseFloat((remainingSavings / flat.netIncome || 0).toFixed(2)),
      currentSavings: flat.currentSavings,
      investmentPreference: "متوازن",
    },
    financialGoals: [
      {
        goal: "تحقيق صندوق الطوارئ بالكامل",
        targetAmount: flat.emergencyTarget,
        timelineMonths: 12,
        monthlyNeeded: Math.round(flat.emergencyTarget / 12),
      },
      {
        goal: "شراء سيارة جديدة",
        targetAmount: 90000,
        timelineMonths: 24,
        monthlyNeeded: 3750,
      },
      {
        goal: "سداد الديون الملتزمة",
        targetAmount: flat.debt * 24,
        timelineMonths: 24,
        monthlyNeeded: flat.debt,
      },
    ],
    simulationScenarios: [
      {
        scenarioName: "الوضع الحالي للادخار",
        monthlySavings: remainingSavings,
        projected10Years: remainingSavings * 120 + flat.currentSavings,
        projected20Years: remainingSavings * 240 + flat.currentSavings,
        notes: "بدون أي تعديل على النمط المالي الحالي",
      },
      {
        scenarioName: "ترشيد المصاريف 15%",
        monthlySavings: Math.round(remainingSavings + totalExp * 0.15),
        projected10Years: Math.round((remainingSavings + totalExp * 0.15) * 120 + flat.currentSavings),
        projected20Years: Math.round((remainingSavings + totalExp * 0.15) * 240 + flat.currentSavings),
        notes: "توفير 15% من النفقات وإدراجها بالكامل بالادخار",
      },
      {
        scenarioName: "استثمار الادخار بعائد 7%",
        monthlySavings: remainingSavings,
        investmentReturn: 0.07,
        projected10Years: Math.round(
          flat.currentSavings * Math.pow(1 + 0.07 / 12, 120) +
            remainingSavings * ((Math.pow(1 + 0.07 / 12, 120) - 1) / (0.07 / 12)) * (1 + 0.07 / 12)
        ),
        projected20Years: Math.round(
          flat.currentSavings * Math.pow(1 + 0.07 / 12, 240) +
            remainingSavings * ((Math.pow(1 + 0.07 / 12, 240) - 1) / (0.07 / 12)) * (1 + 0.07 / 12)
        ),
        notes: "استثمار مبلغ الادخار شهرياً بصناديق متوازنة بعائد سنوي متوسط 7%",
      },
    ],
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  customProfile: FullProfile | null;
  saveCustomProfile: (profile: FullProfile) => Promise<void>;
  loadingProfile: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [customProfile, setCustomProfile] = useState<FullProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Validate connection to Firestore on initial boot as required by skill instructions
  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, "test", "connection"));
      } catch (error) {
        if (error instanceof Error && error.message.includes("the client is offline")) {
          console.error("Please check your Firebase configuration. Client is offline.");
        }
      }
    }
    testConnection();
  }, []);

  // Listen for user auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        // Fetch custom profile if logged in
        setLoadingProfile(true);
        const profilePath = `users/${currentUser.uid}/profiles/custom`;
        try {
          const profileDoc = await getDoc(doc(db, profilePath));
          if (profileDoc.exists()) {
            const data = profileDoc.data() as FlatProfile;
            setCustomProfile(fromFlatProfile(data));
          } else {
            setCustomProfile(null);
          }
        } catch (error) {
          console.error("Failed to load custom profile:", error);
          // Don't crash but report/handle
          try {
            handleFirestoreError(error, OperationType.GET, profilePath);
          } catch (err) {
            // Silently caught for context reporting
          }
        } finally {
          setLoadingProfile(false);
        }
      } else {
        setCustomProfile(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(cred.user, { displayName: name });
    
    // Create the standard user metadata document in Firestore
    const userPath = `users/${cred.user.uid}`;
    try {
      await setDoc(doc(db, userPath), {
        uid: cred.user.uid,
        email: cred.user.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, userPath);
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    
    // Upsert the standard user metadata document in Firestore
    const userPath = `users/${cred.user.uid}`;
    try {
      await setDoc(doc(db, userPath), {
        uid: cred.user.uid,
        email: cred.user.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, userPath);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const saveCustomProfile = async (profile: FullProfile) => {
    if (!user) throw new Error("User must be logged in to save custom profiles");
    setLoadingProfile(true);

    const flat = toFlatProfile(user.uid, profile);
    const profilePath = `users/${user.uid}/profiles/custom`;

    try {
      // Set server timestamp for createdAt/updatedAt
      await setDoc(doc(db, profilePath), {
        ...flat,
        createdAt: flat.createdAt || serverTimestamp(),
        updatedAt: serverTimestamp(),
      }, { merge: true });

      setCustomProfile(profile);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, profilePath);
    } finally {
      setLoadingProfile(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signUpWithEmail,
        signInWithEmail,
        signInWithGoogle,
        logout,
        customProfile,
        saveCustomProfile,
        loadingProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
