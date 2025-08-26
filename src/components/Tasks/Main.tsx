"use client";
import {
  filterOptions,
  statusConfig,
  statusOptions,
} from "@/helpers/task-status";
import { ITaskItem, TaskStore } from "@/store/TaskStore";
import { UserStore } from "@/store/UserStore";
import { Select } from "@/ui/Select";
import { Calendar, Flag, Grip, Plus, User, X, Eye } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";

export type Status = "todo" | "in_progress" | "done" | "blocked";

export const MainTask: React.FC = () => {
  const { tasks, fetchTasks, addTask, deleteTask, editTask, dragTask } =
    TaskStore();
  const { user } = UserStore();

  // --- UI state
  const [filter, setFilter] = useState<"all" | Status>("all");
  const [draggedTask, setDraggedTask] = useState<null | { id: string }>(null);
  const [dragOverTask, setDragOverTask] = useState<string | null>(null);
  const [editing, setEditing] = useState<null | {
    id: string;
    field: "title" | "status" | "start_date" | "end_date";
  }>(null);
  const [editValue, setEditValue] = useState<string>("");

  // --- fetch once user ready
  useEffect(() => {
    if (user?.user_id) fetchTasks();
  }, [user?.user_id, fetchTasks]);

  // --- status configurations

  // --- filter
  const filteredTasks = useMemo(
    () => (filter === "all" ? tasks : tasks.filter((t) => t.status === filter)),
    [tasks, filter]
  );

  // ===== Inline edit helpers
  const startEditing = (
    id: string,
    field: "title" | "status" | "start_date" | "end_date",
    value: string | null
  ) => {
    // Предотвращаем конфликт - если уже редактируем что-то, сначала завершаем
    if (editing) {
      finishEditing();
    }

    setEditing({ id, field });
    if (field === "start_date" || field === "end_date") {
      setEditValue(value ? value.split("T")[0] : "");
    } else {
      setEditValue(value ?? "");
    }
  };

  const normalizeForDb = (
    field: "title" | "status" | "start_date" | "end_date",
    value: string
  ) => {
    if (field === "start_date" || field === "end_date") {
      return value ? new Date(value + "T00:00:00.000Z").toISOString() : null;
    }
    if (field === "status") {
      return value as Status;
    }

    return value;
  };

  const finishEditing = async () => {
    if (!editing) return;

    try {
      const payload = {
        [editing.field]: normalizeForDb(editing.field, editValue),
      };

      await editTask(editing.id, payload);
    } catch (error) {
      console.error("Error updating task:", error);
    } finally {
      // Всегда очищаем состояние редактирования
      setEditing(null);
      setEditValue("");
    }
  };

  const cancelEditing = () => {
    setEditing(null);
    setEditValue("");
  };

  const onEditKeyDown: React.KeyboardEventHandler<HTMLInputElement> = async (
    e
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      await finishEditing();
    }
    if (e.key === "Escape") {
      e.preventDefault();
      cancelEditing();
    }
  };

  // ===== Drag & drop with improved logic
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    // Если редактируем, завершаем редактирование
    if (editing) {
      finishEditing();
    }

    setDraggedTask({ id: taskId });
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", taskId);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedTask(null);
    setDragOverTask(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDragEnter = (e: React.DragEvent, taskId: string) => {
    e.preventDefault();
    if (draggedTask && draggedTask.id !== taskId) {
      setDragOverTask(taskId);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Более точная проверка покидания элемента
    const relatedTarget = e.relatedTarget as HTMLElement;
    const currentTarget = e.currentTarget as HTMLElement;

    if (!currentTarget.contains(relatedTarget)) {
      setDragOverTask(null);
    }
  };

  const handleDrop = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    setDragOverTask(null);

    const draggedId = e.dataTransfer.getData("text/plain") || draggedTask?.id;

    if (!draggedId || draggedId === targetId) {
      setDraggedTask(null);
      return;
    }

    // Используем актуальный список для расчета позиций
    const currentList = filteredTasks.length ? filteredTasks : tasks;
    const sortedList = [...currentList].sort((a, b) => (a.order || 0) - (b.order || 0));

    const fromIndex = sortedList.findIndex((t) => t.id === draggedId);
    const toIndex = sortedList.findIndex((t) => t.id === targetId);

    if (fromIndex === -1 || toIndex === -1) {
      setDraggedTask(null);
      return;
    }

    // Улучшенная логика расчета новой позиции
    let newOrder: number;

    if (fromIndex < toIndex) {
      // Перемещение вниз
      const nextTask = sortedList[toIndex + 1];
      const targetOrder = sortedList[toIndex].order || 0;
      const nextOrder = nextTask ? (nextTask.order || 0) : targetOrder + 1000;
      newOrder = targetOrder + (nextOrder - targetOrder) / 2;
    } else {
      // Перемещение вверх
      const prevTask = sortedList[toIndex - 1];
      const targetOrder = sortedList[toIndex].order || 0;
      const prevOrder = prevTask ? (prevTask.order || 0) : targetOrder - 1000;
      newOrder = prevOrder + (targetOrder - prevOrder) / 2;
    }

    try {
      await dragTask(draggedId, newOrder);
    } catch (error) {
      console.error("Error reordering task:", error);
    } finally {
      setDraggedTask(null);
    }
  };

  // ===== Add task
  const handleAddTask = async () => {
    const todayIso = new Date().toISOString();

    try {
      await addTask({
        title: "Новая задача",
        content: "Описание",
        status: "todo",
        start_date: todayIso,
        end_date: todayIso,
      } as ITaskItem);
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  // ===== Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    try {
      return new Date(dateString).toLocaleDateString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return "—";
    }
  };

  // ===== Handle status change
  const handleStatusChange = async (id: string, newStatus: Status) => {
    try {
      await editTask(id, { status: newStatus });
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setEditing(null);
      setEditValue("");
    }
  };

  const handleStatusEditComplete = async () => {
    if (!editing || editing.field !== "status") return;
    await finishEditing();
  };

  // Sorted tasks for proper display
  const displayTasks = useMemo(() => {
    return [...filteredTasks].sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [filteredTasks]);

  return (
    <div className="min-h-screen bg-[#1f1f1f]">
      {/* Header */}
      <div className="border-b border-[#333333] px-4 md:px-6 py-4 md:py-6">
        <div className="max-w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
              📋 <span>Задачи</span>
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Управляйте проектами и задачами
            </p>
          </div>

          {/* Status filter */}
          <div className="w-full md:w-auto">
            <Select
              value={filter}
              options={filterOptions}
              onChange={(value) => setFilter(value as Status)}
              placeholder="Фильтр по статусу"
              className="w-full md:w-48"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 md:px-6 py-4 md:py-6">
        <div className="bg-[#2a2a2a] backdrop-blur-sm rounded-xl border border-[#3a3a3a] shadow-xl">
          {/* Desktop Table Header */}
          <div className="hidden lg:block bg-[#2a2a2a] border-b border-[#3a3a3a]">
            <div className="grid grid-cols-13 gap-4 px-4 py-4">
              <div className="col-span-1 flex items-center justify-center">
                <Grip size={16} className="text-gray-500" />
              </div>
              <div className="col-span-4 flex items-center gap-2 text-xs font-medium text-gray-400 uppercase tracking-wider">
                <User size={14} /> Название
              </div>
              <div className="col-span-2 flex items-center gap-2 text-xs font-medium text-gray-400 uppercase tracking-wider">
                <Flag size={14} /> Статус
              </div>
              <div className="col-span-2 flex items-center gap-2 text-xs font-medium text-gray-400 uppercase tracking-wider">
                <Calendar size={14} /> Начало
              </div>
              <div className="col-span-2 flex items-center gap-2 text-xs font-medium text-gray-400 uppercase tracking-wider">
                <Calendar size={14} /> Конец
              </div>
              <div className="col-span-1 flex items-center justify-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                <X size={14} />
              </div>
              <div className="col-span-1 flex items-center justify-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                <Eye size={14} />
              </div>
            </div>
          </div>

          {/* Tasks */}
          <div className="divide-y divide-[#3a3a3a]">
            {displayTasks.map((task, index) => (
              <div
                key={`${task.id}-${index}`}
                draggable={!editing}
                onDragStart={(e) => handleDragStart(e, task.id)}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDragEnter={(e) => handleDragEnter(e, task.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, task.id)}
                className={`transition-all duration-200 hover:bg-[#3a3a3a]/40 group ${
                  !editing ? 'cursor-move' : 'cursor-default'
                } ${
                  dragOverTask === task.id
                    ? "bg-blue-500/10 border-y-2 border-blue-500/50"
                    : ""
                } ${draggedTask?.id === task.id ? "opacity-50 transform scale-[0.98]" : ""}`}
                style={{
                  userSelect: editing ? 'text' : 'none',
                }}
              >
                {/* Desktop Layout */}
                <div className="hidden lg:grid grid-cols-13 gap-4 px-4 py-4 items-center">
                  {/* Drag Handle */}
                  <div className="col-span-1 flex items-center justify-center">
                    <Grip
                      size={16}
                      className={`transition-colors ${
                        editing
                          ? 'text-gray-600 cursor-not-allowed'
                          : 'text-gray-500 group-hover:text-gray-400 cursor-grab active:cursor-grabbing'
                      }`}
                    />
                  </div>

                  {/* Title */}
                  <div className="col-span-4 min-w-0">
                    {editing?.id === task.id && editing.field === "title" ? (
                      <input
                        className="w-full h-10 bg-gray-800/90 backdrop-blur-sm text-white px-3 rounded-lg border border-gray-600/50 outline-none focus:border-blue-500 transition-colors"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={finishEditing}
                        onKeyDown={onEditKeyDown}
                        autoFocus
                      />
                    ) : (
                      <div
                        onClick={() =>
                          startEditing(task.id, "title", task.title)
                        }
                        className="text-white font-medium truncate hover:text-blue-300 transition-colors cursor-pointer p-2 rounded min-h-[2.5rem] flex items-center"
                      >
                        {task.title}
                      </div>
                    )}
                  </div>

                  {/* Status */}
                  <div className="col-span-2">
                    {editing?.id === task.id && editing.field === "status" ? (
                      <Select
                        value={task.status}
                        options={statusOptions}
                        onChange={(value) =>
                          handleStatusChange(task.id, value as Status)
                        }
                        isEditing={true}
                      />
                    ) : (
                      <button
                        onClick={() =>
                          startEditing(task.id, "status", task.status)
                        }
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium text-white transition-all hover:scale-105 ${
                          statusConfig[task.status].color
                        }`}
                      >
                        <div
                          className={`w-2 h-2 rounded-full ${
                            statusConfig[task.status].dotColor
                          }`}
                        />
                        {statusConfig[task.status].label}
                      </button>
                    )}
                  </div>

                  {/* Start Date */}
                  <div className="col-span-2">
                    {editing?.id === task.id &&
                    editing.field === "start_date" ? (
                      <input
                        type="date"
                        className="w-full h-10 bg-gray-800/90 backdrop-blur-sm text-white px-3 rounded-lg border border-gray-600/50 outline-none focus:border-blue-500 transition-colors"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={finishEditing}
                        onKeyDown={onEditKeyDown}
                        autoFocus
                      />
                    ) : (
                      <div
                        onClick={() =>
                          startEditing(task.id, "start_date", task.start_date)
                        }
                        className="text-gray-300 text-sm hover:text-blue-300 transition-colors cursor-pointer p-2 rounded min-h-[2.5rem] flex items-center"
                      >
                        {formatDate(task.start_date)}
                      </div>
                    )}
                  </div>

                  {/* End Date */}
                  <div className="col-span-2">
                    {editing?.id === task.id && editing.field === "end_date" ? (
                      <input
                        type="date"
                        className="w-full h-10 bg-gray-800/90 backdrop-blur-sm text-white px-3 rounded-lg border border-gray-600/50 outline-none focus:border-blue-500 transition-colors"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={finishEditing}
                        onKeyDown={onEditKeyDown}
                        autoFocus
                      />
                    ) : (
                      <div
                        onClick={() =>
                          startEditing(task.id, "end_date", task.end_date)
                        }
                        className="text-gray-300 text-sm hover:text-blue-300 transition-colors cursor-pointer p-2 rounded min-h-[2.5rem] flex items-center"
                      >
                        {formatDate(task.end_date)}
                      </div>
                    )}
                  </div>

                  {/* Delete */}
                  <div className="col-span-1 flex justify-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTask(task.id);
                      }}
                      className="text-gray-500 hover:text-red-400 transition-colors p-1 rounded-full hover:bg-red-500/10"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <Link
                      href={`/tasks/${task.id}`}
                      className="text-gray-500 hover:text-blue-400 transition-colors p-1 rounded-full hover:bg-blue-500/10"
                    >
                      <Eye size={18} />
                    </Link>
                  </div>
                </div>

                {/* Mobile Layout */}
                <div className="lg:hidden p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 mr-3">
                      {editing?.id === task.id && editing.field === "title" ? (
                        <input
                          className="w-full h-10 bg-gray-800/90 backdrop-blur-sm text-white px-3 rounded-lg border border-gray-600/50 outline-none focus:border-blue-500 transition-colors"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={finishEditing}
                          onKeyDown={onEditKeyDown}
                          autoFocus
                        />
                      ) : (
                        <h3
                          onClick={() =>
                            startEditing(task.id, "title", task.title)
                          }
                          className="text-white font-medium text-lg leading-tight hover:text-blue-300 transition-colors cursor-pointer"
                        >
                          {task.title}
                        </h3>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Grip
                        size={16}
                        className={`${
                          editing
                            ? 'text-gray-600 cursor-not-allowed'
                            : 'text-gray-500 cursor-grab active:cursor-grabbing'
                        }`}
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteTask(task.id);
                        }}
                        className="text-gray-500 hover:text-red-400 transition-colors p-1"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {/* Status */}
                    <div>
                      {editing?.id === task.id && editing.field === "status" ? (
                        <Select
                          value={editValue}
                          options={statusOptions}
                          onChange={(value) =>
                            handleStatusChange(task.id, value as Status)
                          }
                          onComplete={handleStatusEditComplete}
                          isEditing={true}
                        />
                      ) : (
                        <button
                          onClick={() =>
                            startEditing(task.id, "status", task.status)
                          }
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium text-white transition-all hover:scale-105 ${
                            statusConfig[task.status].color
                          }`}
                        >
                          <div
                            className={`w-2 h-2 rounded-full ${
                              statusConfig[task.status].dotColor
                            }`}
                          />
                          {statusConfig[task.status].label}
                        </button>
                      )}
                    </div>

                    {/* Dates */}
                    <div className="flex flex-col sm:flex-row gap-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-400">
                        <Calendar size={14} />
                        <span>Начало:</span>
                        {editing?.id === task.id &&
                        editing.field === "start_date" ? (
                          <input
                            type="date"
                            className="bg-gray-800/90 backdrop-blur-sm text-white px-2 py-1 rounded border border-gray-600/50 outline-none focus:border-blue-500 transition-colors text-xs"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={finishEditing}
                            onKeyDown={onEditKeyDown}
                            autoFocus
                          />
                        ) : (
                          <span
                            onClick={() =>
                              startEditing(
                                task.id,
                                "start_date",
                                task.start_date
                              )
                            }
                            className="text-gray-300 hover:text-blue-300 transition-colors cursor-pointer"
                          >
                            {formatDate(task.start_date)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-gray-400">
                        <Calendar size={14} />
                        <span>Конец:</span>
                        {editing?.id === task.id &&
                        editing.field === "end_date" ? (
                          <input
                            type="date"
                            className="bg-gray-800/90 backdrop-blur-sm text-white px-2 py-1 rounded border border-gray-600/50 outline-none focus:border-blue-500 transition-colors text-xs"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={finishEditing}
                            onKeyDown={onEditKeyDown}
                            autoFocus
                          />
                        ) : (
                          <span
                            onClick={() =>
                              startEditing(task.id, "end_date", task.end_date)
                            }
                            className="text-gray-300 hover:text-blue-300 transition-colors cursor-pointer"
                          >
                            {formatDate(task.end_date)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Empty state */}
            {displayTasks.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <Flag size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Задач не найдено</p>
                <p className="text-sm mt-1">
                  {filter === "all"
                    ? "Добавьте свою первую задачу"
                    : `Нет задач со статусом "${
                        statusConfig[filter as Status]?.label
                      }"`}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Add New Task Button */}
        <button
          onClick={handleAddTask}
          className="mt-4 w-full px-4 py-4 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 text-sm font-medium border-2 border-dashed border-[#3a3a3a] hover:border-gray-600/50 group"
        >
          <Plus
            size={20}
            className="group-hover:rotate-90 transition-transform duration-200"
          />
          Добавить задачу
        </button>
      </div>
    </div>
  );
};
