import { DashboardStore } from "@/store/Dashboard";
import { X } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";

interface IGoalModal {
  setGoalModal: Dispatch<SetStateAction<boolean>>;
}

export const GoalModal = ({ setGoalModal }: IGoalModal) => {
  const { addGoal } = DashboardStore();
  const [goalState, setGoalState] = useState({ price: 0, name: "" });

  const createGoals = () => {
    addGoal(goalState.price, goalState.name);
    setGoalModal(false);
    setGoalState({ price: 0, name: "" });
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg w-96 relative shadow-lg">
        <button
          className="absolute top-3 right-3 text-white"
          onClick={() => setGoalModal(false)}
        >
          <X />
        </button>
        <h2 className="text-white text-xl mb-4 font-semibold">Добавить цель</h2>
        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Сумма"
            value={goalState.price}
            onChange={(e) =>
              setGoalState({ ...goalState, price: Number(e.target.value) })
            }
            className="p-2 rounded bg-gray-700 text-white border border-gray-600"
          />
          <input
            type="text"
            value={goalState.name}
            onChange={(e) =>
              setGoalState({ ...goalState, name: e.target.value })
            }
            placeholder="Введите название цели"
            className="p-2 rounded bg-gray-700 text-white border border-gray-600"
          />

          <button
            onClick={createGoals}
            className="bg-red-500 hover:bg-red-400 text-white p-2 rounded font-semibold"
          >
            Добавить
          </button>
        </div>
      </div>
    </div>
  );
};
