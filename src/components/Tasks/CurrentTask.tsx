import { ArrowLeft, Minimize2, Maximize2, Flag, Calendar } from "lucide-react";
import { Dispatch } from "react";


interface ICurrentTask {
  isFullWidth: boolean;
  closeTaskDetail: () => void;
  setIsFullWidth: Dispatch<boolean>
}



export const CurrentTask = () => {
  return (
    <section>
      <div className="min-h-screen bg-gray-900 w-full">
        {/* Detail Header */}
        <div
          className={`bg-gray-800 border-b border-gray-700 px-6 py-4 ${
            isFullWidth ? "" : "max-w-4xl mx-auto"
          }`}
        >
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
                title={isFullWidth ? "Обычная ширина" : "Полная ширина"}
              >
                {isFullWidth ? (
                  <Minimize2 size={20} />
                ) : (
                  <Maximize2 size={20} />
                )}
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
        <div className={`px-6 py-6 ${isFullWidth ? "" : "max-w-4xl mx-auto"}`}>
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
                    <h1 className="text-3xl font-bold text-white mb-4">
                      {selectedTask.name}
                    </h1>
                    <div className="flex flex-wrap items-center gap-4">
                      <span
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                          statusColors[selectedTask.status]
                        }`}
                      >
                        <StatusIcon status={selectedTask.status} />
                        {selectedTask.status}
                      </span>
                      <span
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium text-white ${
                          priorityColors[selectedTask.priority]
                        }`}
                      >
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
                    <h3 className="text-lg font-semibold text-white mb-3">
                      Описание
                    </h3>
                    <div className="bg-gray-700 rounded-lg p-4">
                      <p className="text-gray-300 leading-relaxed">
                        {selectedTask.description || "Описание не добавлено"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">
                      Исполнитель
                    </h3>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                        {selectedTask.assignee
                          ? selectedTask.assignee.charAt(0)
                          : "У"}
                      </div>
                      <span className="text-gray-300">
                        {selectedTask.assignee || "Не назначен"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">
                      Даты
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
                        <Calendar size={16} className="text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-400">
                            Дата начала
                          </div>
                          <div className="text-white">
                            {selectedTask.startDate
                              ? new Date(
                                  selectedTask.startDate
                                ).toLocaleDateString("ru-RU")
                              : "Не указана"}
                          </div>
                        </div>
                      </div>
                      <div
                        className={`flex items-center gap-3 p-3 rounded-lg ${
                          isDeadlineNear(selectedTask.endDate)
                            ? "bg-red-900 border border-red-600"
                            : "bg-gray-700"
                        }`}
                      >
                        <Calendar
                          size={16}
                          className={
                            isDeadlineNear(selectedTask.endDate)
                              ? "text-red-400"
                              : "text-gray-400"
                          }
                        />
                        <div>
                          <div className="text-sm text-gray-400">
                            Срок выполнения
                          </div>
                          <div
                            className={`font-medium ${
                              isDeadlineNear(selectedTask.endDate)
                                ? "text-red-400"
                                : "text-white"
                            }`}
                          >
                            {selectedTask.endDate
                              ? new Date(
                                  selectedTask.endDate
                                ).toLocaleDateString("ru-RU")
                              : "Не указан"}
                            {isDeadlineNear(selectedTask.endDate) && (
                              <span className="ml-2 text-xs bg-red-600 px-2 py-1 rounded-full">
                                Скоро
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">
                      Действия
                    </h3>
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
    </section>
  );
};
