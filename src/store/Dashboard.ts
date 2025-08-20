import { create } from "zustand";
import { nanoid } from "nanoid";
import { UserStore } from "./UserStore";
import { supabase } from "@/lib/supabaseClient";

export interface IGoals {
  id: string;
  name: string;
  price: number;
  balance: number;
}

export interface ICurrentBalance {
  price: number;
  date: string;
}

export interface IExpence {
  price: number;
  category: string;
  id: string;
  date: string;
}

export interface IBalancehistory {
  id: string;
  price: number;
  date: string;
}

interface IUser {
  user_id: string;
  email?: string | null;
}

interface IDashboardStore {
  totalProfit: number;
  totalExpence: number;
  currentBalance: ICurrentBalance;
  balanceHistory: IBalancehistory[];
  goals: IGoals[];
  expences: IExpence[];
  isLoading: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  addBalance: (price: number, date: string) => Promise<void>;
  addExpence: (
    price: number,
    category: string,
    date: string,
    goalID?: string
  ) => Promise<void>;
  addGoal: (price: number, name: string) => Promise<void>;
}

type SupabaseError = {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
};

// Hook to get user from UserStore
const useUserStore = UserStore;

export const DashboardStore = create<IDashboardStore>((set, get) => ({
  totalProfit: 0,
  totalExpence: 0,
  currentBalance: { price: 0, date: "" },
  goals: [],
  expences: [],
  balanceHistory: [],
  isLoading: false,
  error: null,

  initialize: async () => {
    set({ isLoading: true, error: null });
    const user: IUser | null = useUserStore.getState().user;

    if (!user?.user_id) {
      set({ error: "User not authenticated", isLoading: false });
      return;
    }

    const userId = user.user_id;

    try {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select(
          "total_profit, total_expense, current_balance, current_balance_date  "
        )
        .eq("user_id", userId)
        .single();

      if (profileError) throw profileError;
        console.log(profileData , "PROFILE DATA")
      const { data: goalsData, error: goalsError } = await supabase
        .from("goals")
        .select("id, name, price, balance")
        .eq("user_id", userId);

      if (goalsError) throw goalsError;

      const { data: expensesData, error: expensesError } = await supabase
        .from("expenses")
        .select("id, price, category, date")
        .eq("user_id", userId);

      if (expensesError) throw expensesError;

      const { data: historyData, error: historyError } = await supabase
        .from("balance_history")
        .select("id, price, date")
        .eq("user_id", userId);

      if (historyError) throw historyError;


      set({
        totalProfit: profileData?.total_profit ?? 0,
        totalExpence: profileData?.total_expense ?? 0,
        currentBalance: {
          price: profileData?.current_balance ?? 0,
          date: profileData?.current_balance_date
            ? new Date(profileData.current_balance_date).toLocaleString("ru-RU")
            : "",
        },
        goals:
          goalsData?.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            balance: item.balance,
          })) ?? [],
        expences:
          expensesData?.map((item) => ({
            id: item.id,
            price: item.price,
            category: item.category,
            date: item.date ? new Date(item.date).toLocaleString("ru-RU") : "",
          })) ?? [],
        balanceHistory:
          historyData?.map((item) => ({
            id: item.id,
            price: item.price,
            date: item.date ? new Date(item.date).toLocaleString("ru-RU") : "",
          })) ?? [],
        isLoading: false,
        error: null,
      });
    } catch (err: unknown) {
      const errorMessage =
        (err as SupabaseError)?.message || "Unknown error occurred";
      set({ error: errorMessage, isLoading: false });
    }
  },

  addBalance: async (price, date) => {
    const user: IUser | null = useUserStore.getState().user;
    if (!user?.user_id) {
      set({ error: "User not authenticated" });
      return;
    }
    const userId = user.user_id;
    const dbDate = date
      ? new Date(date).toISOString()
      : new Date().toISOString();
    const displayDate = date
      ? new Date(date).toLocaleString("ru-RU")
      : new Date().toLocaleString("ru-RU");
    const historyID = nanoid();

    try {
      const { error } = await supabase.from("balance_history").insert({
        user_id: userId,
        price,
        date: dbDate,
      });

      if (error) throw error;

      set((state) => {
        const newBalance = state.currentBalance.price + price;
        return {
          ...state,
          currentBalance: { price: newBalance, date: displayDate },
          balanceHistory: [
            ...(state.balanceHistory || []),
            { id: historyID, price, date: displayDate },
          ],
          totalProfit: state.totalProfit + price,
        };
      });
    } catch (err: unknown) {
      const errorMessage =
        (err as SupabaseError)?.message || "Unknown error occurred";
      set({ error: errorMessage });
    }
  },

  addExpence: async (price, category, date, goalID) => {
    const user: IUser | null = useUserStore.getState().user;
    if (!user?.user_id) {
      set({ error: "User not authenticated" });
      return;
    }
    const userId = user.user_id;
    const newId = nanoid();
    const expenseDate = date || new Date().toISOString();

    try {
      const { data: goalData } = !category && goalID
        ? await supabase.from("goals").select("name").eq("id", goalID).single()
        : { data: null };

      const updateCatName = goalData?.name || category;

      const { error } = await supabase.from("expenses").insert({
        user_id: userId,
        price,
        category: updateCatName,
        date: expenseDate,
        goal_id: goalID || null,
      });

      if (error) throw error;

      set((state) => {
        const newBalance = Math.max(state.currentBalance.price - price, 0);
        let updatedGoals = state.goals;

        if (goalID) {
          updatedGoals = state.goals.map((item) =>
            item.id === goalID
              ? { ...item, balance: item.balance + price }
              : item
          );
        }

        return {
          ...state,
          expences: [
            ...(state.expences || []),
            {
              id: newId,
              price,
              category: updateCatName,
              date: new Date(expenseDate).toLocaleString("ru-RU"),
            },
          ],
          currentBalance: {
            ...state.currentBalance,
            price: newBalance,
            date: new Date().toLocaleString("ru-RU"),
          },
          goals: updatedGoals,
          totalExpence: state.totalExpence + price,
        };
      });
    } catch (err: unknown) {
      const errorMessage =
        (err as SupabaseError)?.message || "Unknown error occurred";
      set({ error: errorMessage });
    }
  },

  addGoal: async (price, name) => {
    const user: IUser | null = useUserStore.getState().user;
    if (!user?.user_id) {
      set({ error: "User not authenticated" });
      return;
    }
    const userId = user.user_id;
    const newID = nanoid();

    try {
      const { error } = await supabase.from("goals").insert({
        user_id: userId,
        name,
        price,
        balance: 0,
      });

      if (error) throw error;

      set((state) => {
        return {
          ...state,
          goals: [
            ...(state.goals || []),
            { id: newID, price, name, balance: 0 },
          ],
        };
      });
    } catch (err: unknown) {
      const errorMessage =
        (err as SupabaseError)?.message || "Unknown error occurred";
      set({ error: errorMessage });
    }
  },
}));
