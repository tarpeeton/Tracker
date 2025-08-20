"use client"
import React, { useState, useMemo } from 'react';
import { Plus, Search, Filter, ArrowLeft, Calendar, Flag, User, Clock, CheckSquare, Square, MoreHorizontal, ChevronDown, X, Maximize2, Minimize2 } from 'lucide-react';

export const MainTask = () => {
  const [tasks, setTasks] = useState([
    {
      id: 1,
      name: "🎯 Запоминание слов на букву А на английском",
      description: "Изучение и запоминание английских слов, начинающихся на букву А. Создание карточек для повторения, практика произношения и использование в контексте.",
      startDate: "2025-08-17",
      endDate: "2025-09-15",
      priority: "Высокий",
      status: "В работе",
      assignee: "Иван Петров",
      chatgpt: "chatgpt.com/c/6...ddebfc"
    },
    {
      id: 2,
      name: "📱 Porno Zavisimost",
      description: "Работа над преодолением зависимости. Изучение методов борьбы, поиск поддержки, разработка здоровых привычек.",
      startDate: "2025-08-20",
      endDate: "2025-08-25",
      priority: "Высокий",
      status: "В работе",
      assignee: "Иван Петров"
    },
    {
      id: 3,
      name: "📚 JavaScript Теория + Example",
      description: "Углубленное изучение JavaScript: теоретические основы, практические примеры, создание проектов для закрепления материала.",
      startDate: "2025-08-15",
      endDate: "2025-08-22",
      priority: "Высокий",
      status: "В работе",
      assignee: "Анна Смирнова"
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isDetailView, setIsDetailView] = useState(false);
  const [isFullWidth, setIsFullWidth] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [draggedTask, setDraggedTask] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Все статусы');
  const [priorityFilter, setPriorityFilter] = useState('Все приоритеты');
  const [deadlineFilter, setDeadlineFilter] = useState('Все сроки');
  const [showFilters, setShowFilters] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    priority: 'Средний',
    status: 'Не начато',
    assignee: '',
    chatgpt: ''
  });

  const priorityColors = {
    'Низкий': 'bg-green-600',
    'Средний': 'bg-yellow-600',
    'Высокий': 'bg-red-600'
  };

  const statusColors = {
    'Не начато': 'text-gray-400 bg-gray-700',
    'В работе': 'text-orange-400 bg-orange-900',
    'Завершено': 'text-green-400 bg-green-900'
  };

  const StatusIcon = ({ status }) => {
    if (status === 'Завершено') return <CheckSquare size={16} className="text-green-400" />;
    if (status === 'В работе') return <Clock size={16} className="text-orange-400" />;
    return <Square size={16} className="text-gray-400" />;
  };

  const isDeadlineNear = (endDate) => {
    const today = new Date();
    const deadline = new Date(endDate);
    const diffTime = deadline - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3;
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'Все статусы' || task.status === statusFilter;

      const matchesPriority = priorityFilter === 'Все приоритеты' || task.priority === priorityFilter;

      let matchesDeadline = true;
      if (deadlineFilter === 'Близкие сроки') {
        matchesDeadline = isDeadlineNear(task.endDate);
      } else if (deadlineFilter === 'Просроченные') {
        matchesDeadline = new Date(task.endDate) < new Date();
      }

      return matchesSearch && matchesStatus && matchesPriority && matchesDeadline;
    });
  }, [tasks, searchTerm, statusFilter, priorityFilter, deadlineFilter]);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      priority: 'Средний',
      status: 'Не начато',
      assignee: '',
      chatgpt: ''
    });
  };

  const openModal = (task = null) => {
    if (task) {
      setEditingTask(task);
      setFormData(task);
    } else {
      setEditingTask(null);
      resetForm();
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
    resetForm();
  };

  const openTaskDetail = (task) => {
    setSelectedTask(task);
    setIsDetailView(true);
  };

  const closeTaskDetail = () => {
    setIsDetailView(false);
    setSelectedTask(null);
    setIsFullWidth(false);
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) return;

    if (editingTask) {
      setTasks(tasks.map(task =>
        task.id === editingTask.id ? { ...formData, id: editingTask.id } : task
      ));
      if (selectedTask && selectedTask.id === editingTask.id) {
        setSelectedTask({ ...formData, id: editingTask.id });
      }
    } else {
      const newTask = {
        ...formData,
        id: Date.now()
      };
      setTasks([...tasks, newTask]);
    }

    closeModal();
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
    if (selectedTask && selectedTask.id === id) {
      closeTaskDetail();
    }
  };

  const toggleTaskStatus = (id) => {
    setTasks(tasks.map(task => {
      if (task.id === id) {
        const newStatus = task.status === 'Завершено' ? 'Не начато' :
                         task.status === 'Не начато' ? 'В работе' : 'Завершено';
        const updatedTask = { ...task, status: newStatus };
        if (selectedTask && selectedTask.id === id) {
          setSelectedTask(updatedTask);
        }
        return updatedTask;
      }
      return task;
    }));
  };

  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetTask) => {
    e.preventDefault();

    if (!draggedTask || draggedTask.id === targetTask.id) return;

    const draggedIndex = tasks.findIndex(task => task.id === draggedTask.id);
    const targetIndex = tasks.findIndex(task => task.id === targetTask.id);

    const newTasks = [...tasks];
    newTasks.splice(draggedIndex, 1);
    newTasks.splice(targetIndex, 0, draggedTask);

    setTasks(newTasks);
    setDraggedTask(null);
  };

  if (isDetailView && selectedTask) {
    return (
      <div className="min-h-screen bg-gray-900 w-full">
        {/* Detail Header */}
        <div className={`bg-gray-800 border-b border-gray-700 px-6 py-4 ${isFullWidth ? '' : 'max-w-4xl mx-auto'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={closeTaskDetail}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <h1 className="text-xl font-medium text-white">Детали задачи</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsFullWidth(!isFullWidth)}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
                title={isFullWidth ? 'Обычная ширина' : 'Полная ширина'}
              >
                {isFullWidth ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
              </button>
              <button
                onClick={() => openModal(selectedTask)}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm transition-colors"
              >
                Редактировать
              </button>
            </div>
          </div>
        </div>

        {/* Detail Content */}
        <div className={`px-6 py-6 ${isFullWidth ? '' : 'max-w-4xl mx-auto'}`}>
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <div className="p-8 space-y-8">
              {/* Task Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <button
                    onClick={() => toggleTaskStatus(selectedTask.id)}
                    className="mt-1 hover:scale-110 transition-transform"
                  >
                    <StatusIcon status={selectedTask.status} />
                  </button>
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-white mb-4">{selectedTask.name}</h1>
                    <div className="flex flex-wrap items-center gap-4">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${statusColors[selectedTask.status]}`}>
                        <StatusIcon status={selectedTask.status} />
                        {selectedTask.status}
                      </span>
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium text-white ${priorityColors[selectedTask.priority]}`}>
                        <Flag size={14} />
                        {selectedTask.priority}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Task Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Описание</h3>
                    <div className="bg-gray-700 rounded-lg p-4">
                      <p className="text-gray-300 leading-relaxed">{selectedTask.description || 'Описание не добавлено'}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Исполнитель</h3>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                        {selectedTask.assignee ? selectedTask.assignee.charAt(0) : 'У'}
                      </div>
                      <span className="text-gray-300">{selectedTask.assignee || 'Не назначен'}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Даты</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
                        <Calendar size={16} className="text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-400">Дата начала</div>
                          <div className="text-white">{selectedTask.startDate ? new Date(selectedTask.startDate).toLocaleDateString('ru-RU') : 'Не указана'}</div>
                        </div>
                      </div>
                      <div className={`flex items-center gap-3 p-3 rounded-lg ${isDeadlineNear(selectedTask.endDate) ? 'bg-red-900 border border-red-600' : 'bg-gray-700'}`}>
                        <Calendar size={16} className={isDeadlineNear(selectedTask.endDate) ? 'text-red-400' : 'text-gray-400'} />
                        <div>
                          <div className="text-sm text-gray-400">Срок выполнения</div>
                          <div className={`font-medium ${isDeadlineNear(selectedTask.endDate) ? 'text-red-400' : 'text-white'}`}>
                            {selectedTask.endDate ? new Date(selectedTask.endDate).toLocaleDateString('ru-RU') : 'Не указан'}
                            {isDeadlineNear(selectedTask.endDate) && (
                              <span className="ml-2 text-xs bg-red-600 px-2 py-1 rounded-full">Скоро</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Действия</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openModal(selectedTask)}
                        className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                      >
                        Редактировать
                      </button>
                      <button
                        onClick={() => deleteTask(selectedTask.id)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 w-full">
      {/* Header */}
      <div className=" border-b border-gray-700 px-6 py-4">
        <div className="max-w-full">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-semibold text-white">📋 Задачи</h1>
              <p className="text-gray-400 text-sm mt-1">Управляйте проектами и задачами</p>
            </div>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="px-6 py-6">
        <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
          {/* Table Header */}
          <div className="bg-gray-750 border-b border-gray-700">
            <div className="grid grid-cols-12 gap-4 px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
              <div className="col-span-4 flex items-center gap-2">
                <User size={14} />
                Название Рутина
              </div>

              <div className="col-span-2 flex items-center gap-2">
                <Flag size={14} />
                Status
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <Calendar size={14} />
                Start date
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <Calendar size={14} />
                End date
              </div>
              <div className="col-span-1 flex items-center gap-2">
                <Flag size={14} />
                Priority
              </div>

            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-700">
            {filteredTasks.map((task, index) => (
              <div
                key={task.id}
                draggable
                onDragStart={(e) => handleDragStart(e, task)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, task)}
                onClick={() => openTaskDetail(task)}
                className="grid grid-cols-12 gap-4 px-4 py-4 hover:bg-gray-750 transition-colors group cursor-pointer"
              >
                {/* Task Name */}
                <div className="col-span-4 flex items-start gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTaskStatus(task.id);
                    }}
                    className="mt-0.5 hover:scale-110 transition-transform"
                  >
                    <StatusIcon status={task.status} />
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="text-white font-medium hover:text-blue-400 transition-colors cursor-pointer">
                      {task.name}
                    </div>
                  </div>
                </div>



                {/* Status */}
                <div className="col-span-2 flex items-center">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusColors[task.status]}`}>
                    {task.status}
                  </span>
                </div>

                {/* Start Date */}
                <div className="col-span-2 flex items-center text-gray-300 text-sm">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} className="text-gray-400" />
                    {task.startDate ? new Date(task.startDate).toLocaleDateString('ru-RU') : '—'}
                  </div>
                </div>
                {/* end Date */}
                <div className="col-span-2 flex items-center text-gray-300 text-sm">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} className="text-gray-400" />
                    {task.startDate ? new Date(task.endDate).toLocaleDateString('ru-RU') : '—'}
                  </div>
                </div>

                {/* Priority */}
                <div className="col-span-1 flex items-center">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white ${priorityColors[task.priority]}`}>
                    {task.priority}
                  </span>
                </div>

              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredTasks.length === 0 && (
            <div className="px-4 py-12 text-center">
              <div className="text-gray-500 text-sm">
                {searchTerm || statusFilter !== 'Все статусы' || priorityFilter !== 'Все приоритеты' || deadlineFilter !== 'Все сроки'
                  ? 'Задачи не найдены по заданным критериям'
                  : 'Пока нет задач. Создайте первую задачу!'}
              </div>
            </div>
          )}
        </div>

        {/* Add New Row */}
        <button
          onClick={() => openModal()}
          className="mt-2 w-full px-4 py-3 text-left text-gray-400 hover:text-gray-300 hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-2 text-sm"
        >
          <Plus size={16} />
          Добавить задачу
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg w-full max-w-2xl border border-gray-700 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-xl font-semibold text-white">
                {editingTask ? 'Редактировать задачу' : 'Новая задача'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-white text-2xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Task Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Название задачи</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Добавьте описание..."
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-2 gap-6">
                {/* Assignee */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Исполнитель</label>
                  <input
                    type="text"
                    value={formData.assignee}
                    onChange={(e) => setFormData({...formData, assignee: e.target.value})}
                    placeholder="Назначить исполнителя..."
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Статус</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Не начато">Не начато</option>
                    <option value="В работе">В работе</option>
                    <option value="Завершено">Завершено</option>
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Приоритет</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Низкий">Низкий</option>
                    <option value="Средний">Средний</option>
                    <option value="Высокий">Высокий</option>
                  </select>
                </div>



                {/* Start Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Дата начала</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Срок выполнения</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-700">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors font-medium"
              >
                {editingTask ? 'Сохранить' : 'Создать'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
