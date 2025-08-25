"use client";
import { filterOptions } from "@/helpers/task-status";
import { supabase } from "@/lib/supabaseClient";
import { ITaskItem, TaskStore } from "@/store/TaskStore";
import { UserStore } from "@/store/UserStore";
import { MyCalendar } from "@/ui/calendar";
import { Select } from "@/ui/Select";
import "@blocknote/core/fonts/inter.css";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useCreateBlockNote } from "@blocknote/react";
import { debounce } from "lodash";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Status } from "../Main";

export const NotionTaskEditor: React.FC = () => {
  const editor = useCreateBlockNote();
  const { id } = useParams();
  const { user } = UserStore();
  const { editTask } = TaskStore();
  const [editorChange, setEditorChange] = useState(false);
  const [task, setTask] = useState<ITaskItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [title, setTitle] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [status, setStatus] = useState<Status>("todo");

  // Fetch task on mount
  useEffect(() => {
    if (!id || !user) return;

    const fetchTask = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user.user_id)
        .eq("id", id)
        .single();

      if (error || !data) {
        console.error("Error fetching task:", error);
        setLoading(false);
        return;
      }

      setTask(data);
      setTitle(data.title);
      setStartDate(data.start_date);
      setEndDate(data.end_date || "");
      setStatus(data.status);

      if (data.content && editor) {
        try {
          const blocks = JSON.parse(data.content);
          editor.replaceBlocks(editor.document, blocks);
        } catch (err) {
          console.error("Error parsing content:", err);
        }
      }

      setLoading(false);
    };

    fetchTask();
  }, [id, user, editor]);

  // Unified debounced save
  const saveTask = useCallback(
    debounce(async (updates: Partial<ITaskItem>) => {
      if (!task || !user) return;
      setSaving(true);
      try {
        const { error } = await supabase
          .from("tasks")
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq("id", task.id)
          .eq("user_id", user.user_id);

        if (error) console.error("Error saving task:", error);
        else {
          editTask(task.id, updates);
          setTask((prev) => (prev ? { ...prev, ...updates } : null));
        }
      } catch (err) {
        console.error("Save task error:", err);
      } finally {
        setSaving(false);
      }
    }, 400),
    [task, user, editTask]
  );

  // Watch input changes
  useEffect(() => {
    if (!task) return;

    if (
      task.title !== title ||
      task.start_date !== startDate ||
      task.end_date !== (endDate || null) ||
      task.status !== status
    ) {
      saveTask({
        title,
        start_date: startDate,
        end_date: endDate || null,
        status,
      });
    }
  }, [title, startDate, endDate, status, task, saveTask]);

  // Watch editor changes via onChange
  useEffect(() => {
    if (!editor || !task) return;

    const debouncedSave = debounce(() => {
      const contentString = JSON.stringify(editor.document);
      if (task.content !== contentString) {
        saveTask({ content: contentString });
      }
    }, 400);

    const unsubscribe = editor.onChange?.(() => {
      debouncedSave();
    });

    return () => {
      debouncedSave.cancel();
      if (unsubscribe) unsubscribe();
    };
  }, [editorChange, saveTask]);

  const contentChange = async () => {
    setEditorChange(true);
  };

  if (loading)
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-500">
        Loading task...
      </div>
    );

  if (!task)
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-500">
        Task not found
      </div>
    );

  return (
    <div className="w-full h-full flex flex-col px-[120px] lg:pt-[100px] bg-[#1f1f1f]">
      <div className="border-b p-4 space-y-4">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title..."
            className="text-2xl font-bold bg-transparent border-none outline-none flex-1 placeholder-gray-400"
          />
          {saving && <div className="text-xs text-gray-500">Saving...</div>}
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="w-[200px]">
            <Select
              value={status}
              options={filterOptions}
              onChange={(value) => setStatus(value as Status)}
              placeholder="Фильтр по статусу"
              className="w-full md:w-48"
            />
          </div>

          <MyCalendar value={startDate} setDate={setStartDate} />
          <MyCalendar value={endDate} setDate={setEndDate} />
        </div>
      </div>
      <div className="flex-1 lg:mt-[50px]">
        <BlockNoteView editor={editor} onChange={contentChange} />
      </div>
    </div>
  );
};
