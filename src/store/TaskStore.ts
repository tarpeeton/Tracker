import { create } from "zustand";
import { supabase } from "@/lib/supabaseClient";
import { UserStore } from "./UserStore";

export interface ITaskItem {
  id: string;
  title: string;
  content: string | null;
  status: "todo" | "in_progress" | "done" | "blocked";
  start_date: string;
  end_date: string | null;
  order: number;
  created_at: string;
  updated_at: string;
}

interface ITaskStore {
  tasks: ITaskItem[];
  fetchTasks: () => Promise<void>;
  addTask: (
    task: Omit<ITaskItem, "id" | "created_at" | "updated_at">
  ) => Promise<void>;
  editTask: (taskID: string, updates: Partial<ITaskItem>) => Promise<void>;
  deleteTask: (taskID: string) => Promise<void>;
  dragTask: (taskID: string, newOrder: number) => Promise<void>;
}


export const TaskStore = create<ITaskStore>((set, get) => ({
  tasks: [],

  // ======================
  // Fetch all tasks
  // ======================
  fetchTasks: async () => {
    const ID = UserStore.getState().user?.user_id;

    if (!ID) {
      console.error("User ID not found");
      return;
    }

    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", ID)
      .order("order", { ascending: true });

    if (error) {
      console.error("Error fetching tasks:", error);
      return;
    }

    set({ tasks: data || [] });
  },

  // ======================
  // Add task
  // ======================
  addTask: async (task) => {
    const ID = UserStore.getState().user.user_id;
    // oxirgi order ni olish
    const tasks = get().tasks;
    const maxOrder =
      tasks.length > 0 ? Math.max(...tasks.map((t) => t.order)) : 0;

    const { data, error } = await supabase
      .from("tasks")
      .insert([{ ...task, user_id: ID, order: maxOrder + 1 }])
      .select("*")
      .single();

    if (error) {
      console.error("Error adding task:", error);
      return;
    }

    set((state) => ({
      tasks: [...state.tasks, data].sort((a, b) => a.order - b.order),
    }));
  },

  // ======================
  // Edit task
  // ======================
  editTask: async (taskID, updates) => {
    const ID = UserStore.getState().user.user_id;
    console.log(updates , "JALAP MANNS")
    const { data, error } = await supabase
      .from("tasks")
      .update(updates)
      .eq("id", taskID)
      .eq("user_id", ID)
      .select("*")
      .single();

    if (error) {
      console.error("Error updating task:", error);
      return;
    }

    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === taskID ? data : t)),
    }));
  },

  // ======================
  // Delete task
  // ======================
  deleteTask: async (taskID) => {
    const ID = UserStore.getState().user.user_id;

    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", taskID)
      .eq("user_id", ID);

    if (error) {
      console.error("Error deleting task:", error);
      return;
    }

    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== taskID),
    }));
  },

  // ======================
  // Drag task (update order)
  // ======================
  dragTask: async (taskID, newOrder) => {
    const ID = UserStore.getState().user.user_id;

    const { data, error } = await supabase
      .from("tasks")
      .update({ order: newOrder })
      .eq("id", taskID)
      .eq("user_id", ID)
      .select("*")
      .single();

    if (error) {
      console.error("Error dragging task:", error);
      return;
    }

    set((state) => ({
      tasks: state.tasks
        .map((t) => (t.id === taskID ? data : t))
        .sort((a, b) => a.order - b.order),
    }));
  },
}));
